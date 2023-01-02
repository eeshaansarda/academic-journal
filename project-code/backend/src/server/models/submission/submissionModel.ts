import {Schema, Document, model, Model, FilterQuery, UpdateQuery} from "mongoose";
import {IUser, UserDoesNotExistError, UserModel} from "@models/user/userModel";
import path from "path";
import { config } from "@config/config";
import {FileUtilities} from "@helper/path/path";
import {escapeRegExp, uniq} from "lodash";
import {IReview, ReviewDecision, ReviewModel} from "@models/review/reviewModel";
import {ApiSubmission} from "@validation/body/apiSubmission";
import {BaseRepository} from "@models/baseRepository";
import {ImportedComment, ImportedSubmission, SsoUserImporter} from "@helper/superGroup/import/import";
import {v4 as uuidv4} from "uuid";
import {IComment} from "@models/comment/commentModel";
import {SubmissionsQuery} from "@validation/query/submissionsQuery";
import {IVersion, versionSchema} from "@models/submission/version/versionModel";
import {GetPublicationsQuery} from "@validation/query/getPublicationQuery";
import {
    ISupportingDocument,
    supportingDocumentSchema
} from "@models/submission/supportingDocument/supportingDocumentModel";
import {BadRequestError} from "routing-controllers";
import Logger, {Level} from "@helper/logger/Logger";
import {sanitize} from "sanitizer";

export interface ISubmission extends Document {
    directory: string;
    author: Schema.Types.ObjectId | IUser;
    coAuthors: (Schema.Types.ObjectId | IUser)[];
    description: string;
    title: string;
    reviewers: (Schema.Types.ObjectId | IUser)[]
    published: boolean;
    versions: IVersion[];
    supportingDocuments: ISupportingDocument[];
    stats: { publishedVisits: number }
    deleteSupportingDocument: (documentId: string) => Promise<void>;
    getPath: (version?: string) => string;
    performValidation: () => Promise<void>;
    getReviews: () => Promise<IReview[]>;
    allReviewsSubmitted: () => Promise<boolean>;
    getReviewsForUser: (userId: string) => Promise<IReview[]>;
    incrementVersion: (versionId: string, file: { destination: string, filename: string }) => Promise<void>;
    assertAuthor: (userId: string) => boolean;
    getLatestVersion: () => IVersion;
    addSupportingDocument: (filename: string, id: string) => Promise<void>;
    getAuthorIds: () => string[];
    isReviewer: () => Promise<boolean>;
}

export interface ISubmissionRepository extends BaseRepository<ISubmission> {
    createSubmission: (submission: ApiSubmission, file: { filename: string, destination: string }) => Promise<void>;
    findAndPopulate: (submissionId: string) => Promise<ISubmission>;
    findByTitle: (filter: SubmissionsQuery) => Promise<[number, ISubmission[]]>;
    getAndPopulate: (filter: FilterQuery<ISubmission>) => Promise<ISubmission[]>;
    getOneAndPopulate: (filter: FilterQuery<ISubmission>) => Promise<ISubmission>;
    numDocuments: () => Promise<number>;
    importSubmission: (metadata: ImportedSubmission) => Promise<ISubmission>;
    assignReviewers: (submissionId: string, userIds: string[]) => Promise<void>;
    assignCoAuthors: (submissionId: string, userIds: string[]) => Promise<void>;
    publish: (submissionId: string) => Promise<void>;
    getPublication: (submissionId: string) => Promise<ISubmission>;
    getSubmissionWithVersion: (submissionId: string, versionId: string) => Promise<ISubmission>;
    getSubmissionsWithNoReviewers: (pageNumber: number) => Promise<[number, ISubmission[]]>;
    findPublishedByTitle: (query: GetPublicationsQuery) => Promise<[number, ISubmission[]]>;
    getPublicationOfTheDay: () => Promise<ISubmission>;
    getFeaturedPublications: () => Promise<ISubmission[]>;
    resetStats: () => Promise<void>;
}

export type ISubmissionModel = ISubmissionRepository & Model<ISubmission>;

/**
 * The submission schema.
 */
const submissionSchema = new Schema<ISubmission, ISubmissionModel>({
    directory: { type: String, required: true, unique: true, trim: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    description: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    coAuthors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    published: { type: Boolean, required: true },
    reviewers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    versions: [versionSchema],
    supportingDocuments: [supportingDocumentSchema],
    stats: {
        publishedVisits:  { type: Number, default: 0 }
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export class InvalidFileError extends Error {}
export class AuthorDoesNotExistError extends Error {}
export class NoAssociatedVersionsError extends Error {}

/**
 * Hook that checks a submission has at least one version before it 
 * is saved.
 */
submissionSchema.pre('save', function (this: ISubmission, next) {
    if (this.versions.length === 0)
        throw new NoAssociatedVersionsError();

    next();
});

/**
 * Creates a submission.
 * @param submission The API submission.
 * @param file The file content of the submission.
 */
submissionSchema.statics.createSubmission = async function (submission: ApiSubmission, file: { filename: string, destination: string }) {
    const author = await UserModel.findOne({id: submission.author.id});

    if (!author)
        throw new AuthorDoesNotExistError("the given author specified does not exist");

    const submissionToAdd = new SubmissionModel({
        directory: submission.submissionId,
        description: submission.description,
        title: submission.title,
        author: author._id,
        published: false,
        versions: [{ version: submission.initialVersion, fileName: file.filename, directory: path.parse(file.destination).name }]
    });

    await submissionToAdd.save();
}

/**
 * Finds and populates a submission.
 * @param submissionId The ID of the submission.
 * @returns Promise that resolves with the populated submission.
 */
submissionSchema.statics.findAndPopulate = async function (submissionId: string) {
    return await SubmissionModel.findOne({directory: submissionId})
        .populate('author')
        .exec();
}

const PAGE_SIZE = 10;

/**
 * Finds a list of submissions by title.
 * @param submissionsQuery The query.
 * @returns Promise that resolves with the number and list of submissions.
 */
submissionSchema.statics.findByTitle = async function (submissionsQuery: SubmissionsQuery) {
    const {pageNumber, title = "", sort, userId, published} = submissionsQuery;

    const searchObject : any = {};

    if (userId) {
        const user = (await UserModel.findOne({ id: userId }, { _id: 1 }))?._id ?? undefined;
        searchObject.$or = [{ author: user}, { coAuthors: user }];
    }

    if (published !== undefined) {
        searchObject.published = published;
    }

    if (title.trim() !== "")
        searchObject.title = { $regex: "^" + escapeRegExp(submissionsQuery.title) + ".*", $options: 'i' };

    const pageIndex = Math.max(0, pageNumber - 1);

    const numSubmissions = await SubmissionModel.countDocuments(searchObject);
    const submissions = await SubmissionModel.find(searchObject)
        .sort({created_at: sort})
        .skip(pageIndex * PAGE_SIZE)
        .populate('author')
        .populate('reviewers')
        .limit(PAGE_SIZE)
        .exec();

    return [numSubmissions, submissions];
}

/**
 * Gets a list of submissions with no assigned reviewers.
 * @param pageNumber The page number.
 * @returns Promise that resolves with the number and list of submissions.
 */
submissionSchema.statics.getSubmissionsWithNoReviewers = async function (pageNumber: number) {
    const pageIndex = Math.max(0, pageNumber - 1);

    const numDocuments = await SubmissionModel.countDocuments({ reviewers: { $size: 0 } });
    const submissions = await SubmissionModel.find({ reviewers: { $size: 0 }})
        .skip(pageIndex * PAGE_SIZE)
        .populate('author')
        .populate('reviewers')
        .limit(PAGE_SIZE)
        .exec();

    return [numDocuments, submissions];
}

export class SubmissionDoesNotExistError extends Error {}
export const fileUtilities = new FileUtilities();

/**
 * Performs extra validation on a submission. Ensures that the corresponding
 * file for the submission exists.
 * @param this The submission.
 */
submissionSchema.methods.performValidation = async function (this: ISubmission) {
    if (!(await fileUtilities.fileExists(this.getPath())))
        throw new SubmissionDoesNotExistError("the submission specified could not be found");
}

export class VersionDoesNotExistError extends Error {}

/**
 * Gets the path to the file for a submission.
 * @param this The submission.
 * @param version The version (optional).
 * @returns The path to the submission file.
 */
submissionSchema.methods.getPath = function (this: ISubmission, version?: string) {
    const versionObj = !version ? this.versions[0] : this.versions.find(v => v.version === version);

    if (!versionObj)
        throw new VersionDoesNotExistError('the version specified does not exist');

    return path.join(config.baseSubmissionFolder, `${versionObj.directory}.zip`);
}

/**
 * Gets a list of reviews on a submission.
 * @param this The submission.
 * @returns Promise that resolves with the list of reviews.
 */
submissionSchema.methods.getReviews = async function (this: ISubmission) {
    return ReviewModel.find({submissionId: this._id, version: this.versions[0].version})
        .populate('owner')
        .populate('comments.commenter')
        .populate('submissionId');
}

/**
 * Gets all the reviews that have a decision on a submission.
 * @param this The submission.
 * @returns Promise that resolves with a list of the reviews.
 */
submissionSchema.methods.allReviewsSubmitted = async function (this: ISubmission) {
    const reviews = await ReviewModel.find({submissionId: this._id});
    return reviews.every(review => review.isDecisionReleased());
}

export class DocumentDoesNotExistError extends Error {}

/**
 * Deletes a supporting document of a submission.
 * @param this The submission.
 * @param documentId The ID of the supporting document.
 */
submissionSchema.methods.deleteSupportingDocument = async function (this: ISubmission, documentId: string) {
    const numDocuments = this.supportingDocuments.length;

    const removeDocument = this.supportingDocuments.filter(doc => doc.id !== documentId);

    if (removeDocument.length === numDocuments)
        throw new DocumentDoesNotExistError();

    this.supportingDocuments = removeDocument;
    await this.save();
}

/**
 * Gets all the reviews by a specific user on a submission.
 * @param this The submission.
 * @param userId The ID of the user.
 * @returns Promise that resolves with the list of reviews.
 */
submissionSchema.methods.getReviewsForUser = async function (this: ISubmission, userId: string) {
    const user = await UserModel.findOne({id: userId});

    if (!user)
        throw new ReviewerNotFoundError("the given reviewer does not exist");

    return ReviewModel.find({submissionId: this._id, owner: user._id, version: this.versions[0].version})
        .populate('owner')
        .populate('comments.commenter')
        .populate('submissionId');
}

/**
 * Gets a submission.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the submission.
 */
submissionSchema.statics.getOne = (filterQuery: FilterQuery<ISubmission>) => SubmissionModel.findOne(filterQuery);

/**
 * Gets a list of submissions.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of submissions.
 */
submissionSchema.statics.get = (filterQuery: FilterQuery<ISubmission>) => SubmissionModel.find(filterQuery);

/**
 * Checks whether a submission exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with whether a suitable submission exists.
 */
submissionSchema.statics.docExists = (filterQuery: FilterQuery<ISubmission>) => SubmissionModel.exists(filterQuery);

/**
 * Creates a new submission. Not supported.
 */
submissionSchema.statics.createOne = () => { throw new Error("this method is not supported") };

/**
 * Modifies a submission.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified submission.
 */
submissionSchema.statics.modifyOne = (filterQuery: FilterQuery<ISubmission>, updateQuery: UpdateQuery<ISubmission>) => SubmissionModel.updateOne(filterQuery, updateQuery);

/**
 * Removes a submission.
 * @param filterQuery The filter query.
 */
submissionSchema.statics.removeOne = async (filterQuery: FilterQuery<ISubmission>) => {
    const session = await SubmissionModel.db.startSession();

    await session.withTransaction(async () => {
        const submission = await SubmissionModel.findOne(filterQuery);

        if (!submission)
            throw new SubmissionDoesNotExistError("the given submission does not exist");

        // Delete all reviews with the corresponding submission
        await ReviewModel.deleteMany({submissionId: submission._id});
        await SubmissionModel.deleteOne({ directory: submission.directory });
    });

    await session.endSession();
}

/**
 * Gets and populates a list of submissions.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of populated submissions.
 */
submissionSchema.statics.getAndPopulate = (filterQuery: FilterQuery<ISubmission>) => SubmissionModel.find(filterQuery)
    .populate("author")
    .populate("reviewers")
    .populate("coAuthors").exec();

/**
 * Gets and populates a submission.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the populated submission.
 */
submissionSchema.statics.getOneAndPopulate = (filterQuery: FilterQuery<ISubmission>) => SubmissionModel.findOne(filterQuery)
    .populate("author")
    .populate("reviewers")
    .populate("coAuthors").exec();

/**
 * Counts the total number of submissions.
 * @returns Promise that resolves with the total number of submissions.
 */
submissionSchema.statics.numDocuments = () => SubmissionModel.countDocuments();

const ssoUserImporter = new SsoUserImporter();

/**
 * Imports an SSO user.
 * @param userId The ID of the user.
 * @returns Promise that resolves with the imported user.
 */
async function importUser(userId: string) {
    let author = await UserModel.findOne({ id: userId });

    if (!author) {
        author = await ssoUserImporter.importSsoUser(userId);

        if (!author)
            throw new Error("the author does not exist");
    }
    return author;
}

/**
 * Transforms an array of imported comments.
 * @param comments The imported comments.
 * @returns The transformed comment.
 */
function transformComments(comments: ImportedComment[]) {
    const parentComments = new Map<number | undefined, ImportedComment>();

    return comments.sort((c1, c2) => c1.id - c2.id).map(comment => {
        const transformedComment = { ...comment };
        const parent = parentComments.get(comment.replying);

        if (comment.replying !== undefined && parent) {
            transformedComment.filename = parent.filename;
            transformedComment.anchor = parent.anchor;
        }
        parentComments.set(comment.id, transformedComment);
        return transformedComment;
    });
}

/**
 * Imports a submission.
 * @param metadata The metadata of the submission.
 * @returns Promise that resolves with the imported submission.
 */
submissionSchema.statics.importSubmission = async function (metadata: ImportedSubmission) {
    const submissionId = uuidv4();
    const publication = metadata.publication;
    Logger.prettyLog(Level.TRACE, publication);
    Logger.prettyLog(Level.TRACE, metadata.reviews);

    const session = await SubmissionModel.db.startSession();

    try {
        await session.withTransaction(async (session) => {
            let author = await importUser(publication.owner);
            let coAuthors = await Promise.all(uniq(publication.collaborators).map(author => importUser(author)));
            coAuthors = coAuthors.map(author => author._id);

            const submissionToAdd = new SubmissionModel({
                directory: submissionId,
                description: sanitize(publication.introduction),
                title: publication.title,
                author: author._id,
                versions: [{ fileName: submissionId, directory: submissionId, version: publication.revision }],
                coAuthors,
                published: false
            });
            await submissionToAdd.save({session});


            for (const review of metadata.reviews) {
                let owner = await UserModel.getOne({ id: review.owner });

                if (!owner) {
                    owner = await ssoUserImporter.importSsoUser(review.owner);
                    Logger.prettyLog(Level.ERROR, `Unable to import ${review.owner}`);

                    if (!owner)
                        throw new Error("unable to import owner");
                }

                const reviewModel = new ReviewModel({
                    submissionId: submissionToAdd._id,
                    owner: owner._id,
                    status: { decision: ReviewDecision.UNDETERMINED },
                    comments: [],
                    version: publication.revision
                });

                review.comments = transformComments(review.comments);

                const commentsToAdd = review.comments.map(comment => new Promise<IUser & { _id: any } | null>((res, rej) => {
                    UserModel.findOne({ id: comment.author }).then((user) => res(user) ).catch((err) => rej(err));
                }).then((commenter) => {
                    if (!commenter) {
                        return ssoUserImporter.importSsoUser(comment.author);
                    }
                    return commenter;
                }).then((commenter) => {
                    if (!commenter)
                        throw new Error("unable to import owner");

                    const importedComment : Partial<IComment> = {
                        commenter: commenter._id,
                        payload: sanitize(comment.contents),
                        pathToFile: comment.filename,
                        anchor: comment.anchor,
                        parentId: comment.replying,
                        postedAt: new Date(comment.postedAt),
                        commentId: comment.id
                    };
                    return importedComment;
                }));
                reviewModel.comments = await Promise.all(commentsToAdd) as [IComment];
                await reviewModel.save({session});
            }
        });
    } catch (e) {
        throw new BadRequestError((e as Error).message);
    } finally {
        await session.endSession();
    }

    return SubmissionModel.findOne({ directory: submissionId });
}

/**
 * Assigns co-authors to a submission.
 * @param submissionId The ID of the submission.
 * @param users Array of IDs of the users to be assigned as co-authors.
 */
submissionSchema.statics.assignCoAuthors = async function (submissionId: string, users: string[]) {
    const userPromises = uniq(users).map(id => UserModel.findOne({id}));
    const userModels = await Promise.all(userPromises);

    if (userModels.some(user => user === null))
        throw new AuthorDoesNotExistError("an author could not be found");

    const userObjectIds = userModels.map(user => user?._id);

    const submission = await SubmissionModel.findOneAndUpdate({ directory: submissionId }, { coAuthors: userObjectIds });

    if (!submission)
        throw new SubmissionDoesNotExistError("the submission could not be found");
}

export class ReviewerNotFoundError extends Error {}

/**
 * Assigns reviewers to a submission.
 * @param submissionId The ID of the submission.
 * @param users Array of IDs of users to be assigned as reviewers.
 */
submissionSchema.statics.assignReviewers = async function (submissionId: string, users: string[]) {
    const userPromises = uniq(users).map(id => UserModel.findOne({id}));
    const userModels = await Promise.all(userPromises);

    if (userModels.some(user => user === null))
        throw new ReviewerNotFoundError("a reviewer could not be found");

    const userObjectIds = userModels.map(user => user?._id);

    const submission = await SubmissionModel.findOneAndUpdate({ directory: submissionId }, { reviewers: userObjectIds });

    if (!submission)
        throw new SubmissionDoesNotExistError("could not get the submission");
};

export class SubmissionHasNoReviewsError extends Error {}
export class ReviewDecisionNotDeterminedError extends Error {}

/**
 * Publishes a submission.
 * @param submissionId The ID of the submission.
 */
submissionSchema.statics.publish = async function (submissionId: string) {
    const submission = await SubmissionModel.getOne({ directory: submissionId });

    if (!submission)
        throw new SubmissionDoesNotExistError("the given submission does not exist");

    const reviews = await submission.getReviews();

    if (reviews.length === 0)
        throw new SubmissionHasNoReviewsError("cannot make a decision on a submission that has no reviews");

    const decisionFound = reviews.filter(review => review.status.decision !== ReviewDecision.UNDETERMINED);

    if (decisionFound.length !== reviews.length)
        throw new ReviewDecisionNotDeterminedError("not all reviews have been made");

    submission.published = true;
    await submission.save();
}

export class VersionAlreadyExistsError extends Error {}

/**
 * Adds a new version to a submission.
 * @param this The submission.
 * @param version The new version number.
 * @param file The file content of the new version.
 */
submissionSchema.methods.incrementVersion = async function (this: ISubmission, version: string, file: { destination: string, filename: string }) {
    if (this.versions.some(versionObj => versionObj.version === version))
        throw new VersionAlreadyExistsError("the version already exists");

    this.versions.unshift({ version, directory: path.parse(file.destination).name, fileName: file.filename } as IVersion);
    await this.save();
}

/**
 * Checks if a user is an author of a submission.
 * @param this The submission.
 * @param userId The ID of the user.
 * @returns Promise that resolves with whether the user is an author.
 */
submissionSchema.methods.assertAuthor = function (this: ISubmission, userId: string) {
    const author = this.author as IUser;

    if (author.id === userId)
        return true;

    const coAuthors = this.coAuthors as IUser[];
    return coAuthors.some(author => author.id === userId);
}

/**
 * Adds a supporting document to a submission.
 * @param this The submission.
 * @param fileName The name of the supporting document file.
 * @param documentId The ID of the supporting document.
 * @returns Promise that resolves with the added supporting document.
 */
submissionSchema.methods.addSupportingDocument = async function (this: ISubmission, fileName: string, documentId: string) {
    this.supportingDocuments.push({ fileName, id: documentId } as ISupportingDocument);
    return this.save();
}

/**
 * Gets the latest version of a submission.
 * @param this The submission.
 * @returns The latest version of the submission.
 */
submissionSchema.methods.getLatestVersion = function (this: ISubmission) {
    return this.versions[0];
}

/**
 * Gets a specific version of a submission.
 * @param submissionId The ID of the submission.
 * @param versionId The ID of the version.
 * @returns Promise that resolves with the version of the submission.
 */
submissionSchema.statics.getSubmissionWithVersion = async function (submissionId: string, versionId: string) {
    return SubmissionModel.findOne({directory: submissionId, 'versions.version': versionId})
        .populate('author')
        .populate('coAuthors');
}

/**
 * Finds a list of published submissions by title.
 * @param filter The filter query.
 * @returns Promise that resolves with the list of submissions.
 */
submissionSchema.statics.findPublishedByTitle = async function (filter: GetPublicationsQuery) {
    const { title = "", pageNumber, sort } = filter;

    const pageIndex = Math.max(0, pageNumber - 1);

    const searchObject : any = {
        published: true
    };

    if (filter.userId) {
        const user = await UserModel.findOne({ id: filter.userId });

        if (!user)
            throw new UserDoesNotExistError("the given user does not exist");

        searchObject.$or = [{ author: user}, { coAuthors: user }];
    }

    if (title.trim() !== "")
        searchObject.title = { $regex: "^" + escapeRegExp(title) + ".*", $options: 'i' };

    const numSubmissions = await SubmissionModel.countDocuments(searchObject);
    const submissions = await SubmissionModel.find(searchObject)
        .sort({created_at: sort})
        .skip(pageIndex * PAGE_SIZE)
        .populate('author')
        .limit(PAGE_SIZE)
        .exec();

    return [numSubmissions, submissions || []];
}

/**
 * Gets a published submission.
 * @param submissionId The ID of the submission.
 * @returns Promise that resolves with the published submission.
 */
submissionSchema.statics.getPublication = async function (submissionId: string) {
    return SubmissionModel.findOne( { directory: submissionId, published: true })
        .populate('author')
        .exec();
}

/**
 * Gets the IDs of the authors of a submission.
 * @param this The submission.
 * @returns Array of IDs of the submission authors.
 */
submissionSchema.methods.getAuthorIds = function (this: ISubmission) {
    const author = this.author as IUser;
    const coAuthors = this.coAuthors as IUser[];
    return [author.id, ...coAuthors.map(author => author.id)];
}

/**
 * Checks if a user is assigned as a reviewer on a submission.
 * @param this The submission.
 * @param reviewerId The ID of the reviewer.
 * @returns Whether the user is a reviewer of the submission.
 */
submissionSchema.methods.isReviewer = function (this: ISubmission, reviewerId: string) {
    return (this.reviewers as IUser[]).some(r => r.id === reviewerId);
}

/**
 * Gets the publication of the day.
 * @returns Promise that resolves with the publication of the day.
 */
submissionSchema.statics.getPublicationOfTheDay = function () {
    return SubmissionModel.findOne({ published: true })
        .sort("-stats.publishedVisits")
        .populate("author")
        .populate("reviewers")
        .populate("coAuthors")
        .exec();
}

/**
 * Gets the featured publications.
 * @returns Promise that resolves with the list of featured publications.
 */
submissionSchema.statics.getFeaturedPublications = function () {
    const NUM_FEATURED = 10;
    return SubmissionModel.find({ published: true })
        .sort("-stats.publishedVisits")
        .skip(1)
        .limit(NUM_FEATURED)
        .populate("author")
        .populate("reviewers")
        .populate("coAuthors")
        .exec();
}

/**
 * Resets the features publications.
 */
submissionSchema.statics.resetStats = function () {
    return SubmissionModel.updateMany({ published: true }, { "stats.publishedVisits": 0 });
}

export const SubmissionModel = model<ISubmission, ISubmissionModel>('Submission', submissionSchema);