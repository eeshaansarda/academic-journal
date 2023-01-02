import {IReviewRepository, ReviewDecision, ReviewModel} from "@models/review/reviewModel";
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser, Get,
    JsonController,
    NotFoundError,
    Post, QueryParam,
    UnauthorizedError
} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiPostReview, ApiReview, ApiReviewVerdict} from "@validation/body/apiReview";
import {IUser} from "@models/user/userModel";
import {Service} from "typedi";
import {SubmissionDoesNotExistError} from "@models/submission/submissionModel";

@JsonController("/submission/review")
@Service()
export default class ReviewController {

    public static readonly POST_REVIEW_ENDPOINT = "/";
    public static readonly POST_DECISION_ENDPOINT = "/decision";
    public static readonly GET_REVIEW_ENDPOINT = "/";
    public static readonly GET_DENTS = "/getdents";

    public reviewModel: IReviewRepository = ReviewModel

    /**
     * Endpoint to post a new review.
     * @param user The user who made the request.
     * @param body The request body.
     */
    @Authorized()
    @Post(ReviewController.POST_REVIEW_ENDPOINT)
    public async postReview(@CurrentUser() user: SessionUser,
                            @Body() body: ApiPostReview) {
        try {
            const review = await this.reviewModel.createReview({
                    username: user.username,
                    id: user.id
                }, body.submissionId);

            return {
                status: 'success',
                reviewId: review.reviewId
            };
        } catch (e) {
            if (e instanceof SubmissionDoesNotExistError)
                throw new NotFoundError("the given submission does not exist");

            throw new BadRequestError((e as Error).message);
        }
    }

    /**
     * Endpoint to post a decision on a review.
     * @param user The user who made the request.
     * @param verdict The request body.
     */
    @Authorized()
    @Post(ReviewController.POST_DECISION_ENDPOINT)
    public async postDecision(@CurrentUser() user: SessionUser,
                             @Body() verdict: ApiReviewVerdict) {
        if (verdict.decision === ReviewDecision.UNDETERMINED)
            throw new BadRequestError("invalid decision");

        const review = await this.reviewModel.getAndPopulateReviewer({ reviewId: verdict.reviewId });
        if (!review)
            throw new NotFoundError("the specified review does not exist");

        const reviewer = review.owner as IUser;

        if (reviewer.id !== user.id)
            throw new UnauthorizedError("you do not have the permissions to give a verdict to this review");

        review.status.decision = verdict.decision;
        review.status.verdict = verdict.comment;
        await review.save();

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to get a specific review.
     * @param user The user who made the request.
     * @param reviewId The ID of the review.
     */
    @Authorized()
    @Get(ReviewController.GET_REVIEW_ENDPOINT)
    public async getReview(@CurrentUser() user: SessionUser,
                           @QueryParam("reviewId", { required: true }) reviewId: string) {
        const review = await this.reviewModel.getAndPopulateReviewer({ reviewId });

        if (!review)
            throw new NotFoundError("the review does not exist");

        const reviewer = review.owner as IUser;

        if (!review.isDecisionReleased() && user.id !== reviewer.id)
            throw new UnauthorizedError("you do not have the permission to do this");

        return {
            status: "success",
            review: ApiReview.createApiReviewFromDocument(review)
        };
    }
}