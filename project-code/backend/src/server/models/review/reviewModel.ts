import {Document, FilterQuery, model, Model, Schema, UpdateQuery} from "mongoose";
import {IUser, UserDoesNotExistError, UserModel} from "@models/user/userModel";
import {ISubmission, SubmissionDoesNotExistError, SubmissionModel} from "@models/submission/submissionModel";
import {v4 as uuidv4} from "uuid";
import {ApiReviewer} from "@validation/body/apiReview";
import {BaseRepository} from "@models/baseRepository";
import {IComment} from "@models/comment/commentModel";
import {ApiComment, ApiGeneralComment} from "@validation/body/apiComments";
import {CommentModel} from "@models/comment/commentModel";
import {escapeRegExp} from "lodash";

export enum ReviewDecision {
    READY = 'ready',
    NOT_READY = 'not_ready',
    UNDETERMINED = 'undetermined'
}

export interface IReview extends Document {
    submissionId: Schema.Types.ObjectId | ISubmission;
    version: string;
    reviewId: string;
    owner: Schema.Types.ObjectId | IUser;
    comments: [IComment],
    addComment: (comment: ApiComment) => void;
    addGeneralComment: (comment: ApiGeneralComment) => void;
    status: {
        decision: ReviewDecision;
        verdict: string;
    },
    isDecisionReleased: () => boolean;
}

export interface GetReviewsParams {
    reviewerId?: string;
    submissionId?: string;
    decision?: ReviewDecision;
    pageNumber: number;
    sort: number;
    pageSize?: number;
}

export type IReviewModel = IReviewRepository & Model<IReview>;

export interface IReviewRepository extends BaseRepository<IReview>{
    createReview: (user: Partial<ApiReviewer>, submissionId: string) => Promise<IReview>;
    getGeneralComments: (reviewId: string) => Promise<IComment[]>;
    getComments: (reviewId: string, pathToFile: string) => Promise<IComment[]>;
    getAndPopulateReviewer: (obj: FilterQuery<IReview>) => Promise<IReview>;
    getReviews: (params: GetReviewsParams) => Promise<[number, IReview[]]>;
    countReviewsForUser: (userId: string) => Promise<number>;
    getNumCommentsForPath: (submission: ISubmission, reviewId: string, pathToFile: string) => Promise<number>;
}

/**
 * The review schema.
 */
const reviewSchema = new Schema<IReview, IReviewModel>({
    submissionId: { type: Schema.Types.ObjectId, required: true, ref: 'Submission' },
    version: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    reviewId: { type: String, required: true, unique: true, trim: true },
    comments: [CommentModel.schema],
    status: {
        decision: { type: String, required: true, trim: true },
        verdict: { type: String, trim: true }
    }
}, { timestamps: { createdAt: 'created_at' } });

/**
 * Hook that sets the review ID before it is validated.
 */
reviewSchema.pre('validate', async function (this: IReview, next: any): Promise<void> {
    if (!this.isNew){
        return next();
    }
    this.reviewId = uuidv4();
    next();
});

export class ReviewerDoesNotExistError extends Error {}

/**
 * Creates a review.
 * @param apiOwner The author of the review.
 * @param submissionId The ID of the submission.
 * @returns Promise that resolves with the created review.
 */
reviewSchema.statics.createReview = async function (apiOwner: ApiReviewer, submissionId: string) {
    const owner = await UserModel.findOne({id: apiOwner.id});

    if (!owner)
        throw new ReviewerDoesNotExistError('owner does not exist');

    const submission = await SubmissionModel.findOne({ directory: submissionId });

    if (!submission)
        throw new SubmissionDoesNotExistError('submission with version does not exist');

    const reviewDoc = new ReviewModel({
        reviewId: uuidv4(),
        version: submission.getLatestVersion().version,
        submissionId: submission._id,
        owner: owner._id,
        status: {
            decision: ReviewDecision.UNDETERMINED
        }
    });

    await reviewDoc.save();
    return reviewDoc;
}

export class ParentNotFoundError extends Error {}
export class CommenterDoesNotExist extends Error {}
export class EmptyPayload extends Error {}

/**
 * Checks if the parent of a comment exists.
 * @param review The review.
 * @param comment The comment.
 * @returns Whether the parent exists.
 */
function doesParentExist(review: IReview, comment: ApiComment | ApiGeneralComment) {
    return !comment.parentId || review.comments.some(c => c.commentId === comment.parentId);
}

/**
 * Adds a general comment to a review.
 * @param this The review.
 * @param comment The general comment to be added.
 */
reviewSchema.methods.addGeneralComment = async function (this: IReview, comment: ApiGeneralComment) {
    const commenter = await UserModel.findOne({ id: comment.commenter.userId });

    if (!commenter)
        throw new CommenterDoesNotExist("the specified user does not exist");

    if (comment.payload.trim() === "")
        throw new EmptyPayload('payload is empty');

    if (!doesParentExist(this, comment))
        throw new ParentNotFoundError('the parent comment does not exist');

    const commentToAdd : Partial<IComment> = {
        commenter: commenter._id,
        payload: comment.payload,
        commentId: this.comments.length,
        parentId: comment.parentId ?? undefined,
        postedAt: new Date()
    };

    this.comments.push(commentToAdd as IComment);
    await this.save();
}

/**
 * Adds a comment to a review.
 * @param this The review.
 * @param comment The comment to be added.
 */
reviewSchema.methods.addComment = async function (this: IReview, comment: ApiComment) {
    const commenter = await UserModel.findOne({ id: comment.commenter.userId });

    if (!commenter)
        throw new CommenterDoesNotExist("the commenter specified does not exist");

    if (comment.payload.trim() === "")
        throw new EmptyPayload('payload is empty');

    if (!doesParentExist(this, comment))
        throw new ParentNotFoundError("the parent doesn't exist");

    const commentToAdd : Partial<IComment> = {
        commenter: commenter._id,
        payload: comment.payload,
        pathToFile: comment.pathToFile,
        anchor: comment.anchor,
        parentId: comment.parentId,
        postedAt: new Date(),
        commentId: this.comments.length
    };

    this.comments.push(commentToAdd as IComment);
    await this.save();
}

/**
 * Gets a list of general comments within a review.
 * @param reviewId The ID of the review.
 * @returns Promise that resolves with the list of general comments.
 */
reviewSchema.statics.getGeneralComments = async function (reviewId: string) {
    const reviews = await ReviewModel.aggregate([
        { $match: { reviewId } },
        { $project: {
                comments: {
                    $filter: {
                        input: "$comments",
                        as: "comment",
                        cond: { $eq: [{$type: "$$comment.pathToFile"}, "missing"] }
                    }
                }
            }}
    ]).exec();

    const populatedReview = await ReviewModel.populate(reviews, {"path": "comments.commenter"});

    const comments = populatedReview[0].comments;

    return comments.sort((c1, c2) => {
        return c1.postedAt.getTime() - c2.postedAt.getTime();
    }) ?? [];
}

/**
 * Gets a list of comments on a specific file within a review.
 * @param reviewId The ID of the review.
 * @param pathToFile The path to the file.
 * @returns Promise that resolves with the list of comments.
 */
reviewSchema.statics.getComments = async function (reviewId: string, pathToFile: string) {
    const reviews = await ReviewModel.aggregate([
        { $match: { reviewId } },
        { $project: {
            comments: {
                $filter: {
                    input: "$comments",
                    as: "comment",
                    cond: { $eq: ["$$comment.pathToFile", pathToFile] }
                }
            }
        }}
    ]).exec();

    const populatedReview = await ReviewModel.populate(reviews, {"path": "comments.commenter"});
    const comments = populatedReview[0].comments;

    return comments.sort((c1, c2) => {
        return c1.postedAt.getTime() - c2.postedAt.getTime();
    }) ?? [];
}

/**
 * Gets a review.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the review.
 */
reviewSchema.statics.getOne = (filterQuery: FilterQuery<IReview>) => ReviewModel.findOne(filterQuery);

/**
 * Gets a list of reviews.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of reviews.
 */
reviewSchema.statics.get = (filterQuery: FilterQuery<IReview>) => ReviewModel.find(filterQuery);

/**
 * Checks whether a review exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with whether a suitable review exists.
 */
reviewSchema.statics.docExists = (filterQuery: FilterQuery<IReview>) => ReviewModel.exists(filterQuery);

/**
 * Modifies a review.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified review.
 */
reviewSchema.statics.modifyOne = (filterQuery: FilterQuery<IReview>, updateQuery: UpdateQuery<IReview>) => ReviewModel.updateOne(filterQuery, updateQuery);

/**
 * Removes a review.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed review.
 */
reviewSchema.statics.removeOne = (filterQuery: FilterQuery<IReview>) => ReviewModel.deleteOne(filterQuery);

/**
 * Creates a new review.
 * @param data The review data.
 * @returns Promise that resolves with the created review.
 */
reviewSchema.statics.createOne = async (data: Partial<IReview>) => {
    const review = new ReviewModel(data);
    await review.save();
    return review;
}

/**
 * Gets and populates a reviewer.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the populated reviewer.
 */
reviewSchema.statics.getAndPopulateReviewer = (filterQuery: FilterQuery<IReview>) => {
    return ReviewModel.findOne(filterQuery).populate("owner").exec();
}

/**
 * Gets a list of reviews.
 * @param params The params.
 * @returns Promise that resolves with the number and list of reviews.
 */
reviewSchema.statics.getReviews = async (params: GetReviewsParams) => {
    let { reviewerId, submissionId, decision, pageSize = 10, pageNumber, sort } = params;

    pageNumber = Math.max(0, pageNumber - 1);

    const searchObj: any = {};

    if (submissionId) searchObj.submissionId = (await SubmissionModel.findOne({ directory: submissionId }, { _id: 1 }))?._id ?? undefined;
    if (reviewerId) searchObj.owner = (await UserModel.findOne({ id: reviewerId }, { _id: 1 }))?._id ?? undefined;
    if (decision) searchObj['status.decision'] = decision;

    const reviews = await ReviewModel.find(searchObj)
        .sort({created_at: sort})
        .skip(pageNumber * pageSize)
        .populate('owner')
        .populate('submissionId')
        .limit(pageSize)
        .exec();

    const numReviews = await ReviewModel.countDocuments(searchObj);

    return [numReviews, reviews];
};

/**
 * Counts the number of reviews for a given user.
 * @param userId The ID of the user.
 * @returns Promise that resolves with the number of reviews for the user.
 */
reviewSchema.statics.countReviewsForUser = async (userId: string) => {
    const user = await UserModel.findOne({id: userId});

    if (!user)
        throw new UserDoesNotExistError("the given user does not exist");

    return ReviewModel.countDocuments({ owner: user._id });
}

/**
 * Checks whether a decision has been released for a review.
 * @param this The review.
 * @returns Whether the decision has been released.
 */
reviewSchema.methods.isDecisionReleased = function (this: IReview) {
    return this.status.decision !== ReviewDecision.UNDETERMINED;
}

/**
 * Gets the comments for a given path within a submission.
 * Do not check if all submissions has been released as knowing the
 * number of comments on a file is likely to give any indication of the review.
 *
 * @param submission the submission being examined
 * @param reviewId the id of the review taking place.
 * @param pathToFile the path that we are examining
 */
reviewSchema.statics.getNumCommentsForPath = async function (submission: ISubmission, reviewId: string, pathToFile: string) {
    pathToFile = pathToFile.charAt(0) === '/' ? pathToFile.substr(1) : pathToFile;

    const regex = `^${escapeRegExp(pathToFile)}.*$`;

    if (!(await ReviewModel.docExists({ submissionId: submission._id, review: reviewId })))
        return 0;

    const comments = await ReviewModel.aggregate([
        {
            $match: {
                $and: [
                    { submissionId: submission._id },
                    { reviewId }
                ]
            }
        },
        {
            $unwind: "$comments",
        },
        {
            $match: {
                "comments.pathToFile": { "$regex": regex, $options: "i" }
            }
        },
        {
            $count: "numComments"
        }
    ]) as { numComments: number }[];

    return comments.length > 0 ? comments[0].numComments : 0;
}

export const ReviewModel = model<IReview, IReviewModel>('Review', reviewSchema);