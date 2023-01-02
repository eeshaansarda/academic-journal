import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController, NotFoundError,
    Post,
    QueryParams
} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiComment, ApiGeneralComment} from "@validation/body/apiComments";
import {GetFileCommentsQuery, GetGeneralCommentsQuery} from "@validation/query/getCommentsQuery";
import {IReviewRepository, ReviewModel} from "@models/review/reviewModel";
import sanitizer from "sanitizer";
import {Service} from "typedi";

@JsonController("/submission/review/comment")
@Service()
export default class CommentController {

    public static readonly COMMENT_ENDPOINT = '/';
    public static readonly COMMENT_FILE_ENDPOINT = '/file';

    public reviewModel: IReviewRepository = ReviewModel;

    /**
     * Endpoint to post a new comment.
     * @param sessionUser The user who made the request.
     * @param comment The request body.
     */
    @Authorized()
    @Post(CommentController.COMMENT_ENDPOINT)
    public async comment(@CurrentUser({ required: true }) sessionUser: SessionUser,
                         @Body() comment: ApiGeneralComment) {

        comment.payload = sanitizer.sanitize(comment.payload);
        comment.commenter = {
            userId: sessionUser.id,
            username: sessionUser.username
        };

        const review = await this.reviewModel.getOne({ reviewId: comment.reviewId });

        if (!review)
            throw new NotFoundError("the specified review does not exist");

        try {
            await review?.addGeneralComment(comment);
        } catch (e) {
            throw new BadRequestError((e as Error).message);
        }

        return {
            status: 'success'
        };
    }

    /**
     * Endpoint to post a comment on a specific file.
     * @param sessionUser The user who made the request.
     * @param comment The request body.
     */
    @Post(CommentController.COMMENT_FILE_ENDPOINT)
    @Authorized()
    public async commentFile(@CurrentUser({ required: true }) sessionUser: SessionUser,
                             @Body() comment: ApiComment) {

        comment.payload = sanitizer.sanitize(comment.payload);
        comment.pathToFile = comment.pathToFile ? decodeURIComponent(comment.pathToFile) : undefined;
        comment.commenter = {
            userId: sessionUser.id,
            username: sessionUser.username
        };

        const review = await this.reviewModel.getOne({ reviewId: comment.reviewId });

        if (!review)
            throw new NotFoundError("the specified review does not exist");

        try {
            await review.addComment(comment);
        } catch (e) {
            throw new BadRequestError((e as Error).message);
        }

        return {
            status: 'success'
        };
    }

    /**
     * Endpoint to get a specific comment.
     * @param commentsQuery The query parameters.
     */
    @Authorized()
    @Get(CommentController.COMMENT_ENDPOINT)
    public async getGeneralComments(@QueryParams() commentsQuery: GetGeneralCommentsQuery) {
        if (!(await this.reviewModel.docExists({ reviewId: commentsQuery.reviewId })))
            throw new NotFoundError("the given review does not exist");

        const comments = await this.reviewModel.getGeneralComments(commentsQuery.reviewId);

        const apiComments = comments.map(comment =>
            ApiComment.createApiCommentFromDocument(comment, commentsQuery.reviewId));

        return {
            status: 'success',
            comments: apiComments
        };
    }

    /**
     * Endpoint to get a list of comments on a file.
     * @param commentsQuery The query parameters.
     */
    @Authorized()
    @Get(CommentController.COMMENT_FILE_ENDPOINT)
    public async getCommentsForFile(@QueryParams() commentsQuery: GetFileCommentsQuery) {
        if (!(await this.reviewModel.docExists({ reviewId: commentsQuery.reviewId })))
            throw new NotFoundError("the given review does not exist");

        const comments = await this.reviewModel.getComments(commentsQuery.reviewId, commentsQuery.pathToFile);

        const apiComments = comments.map(comment =>
            ApiComment.createApiCommentFromDocument(comment, commentsQuery.reviewId));

        return {
            status: 'success',
            comments: apiComments
        };
    }
}