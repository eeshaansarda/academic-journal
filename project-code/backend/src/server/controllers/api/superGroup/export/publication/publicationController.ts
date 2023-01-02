import {Response} from "express";
import {ISubmissionRepository, SubmissionModel} from "@models/submission/submissionModel";
import {IUser, IUserRepository, UserModel} from "@models/user/userModel";
import {
    BadRequestError,
    Get,
    HeaderParams,
    JsonController,
    NotFoundError,
    Param,
    Res,
    UnauthorizedError, UseBefore
} from "routing-controllers";
import {GetMetadataHeader, GetSubmissionHeader} from "@validation/headers/apiPublicationHeaders";
import {ApiSGComment, ApiSGPublication} from "@validation/body/apiSGPublication";
import {FileSender, IFileSender} from "@helper/file/file";
import {BearerTokenVerifier, IBearerTokenVerifier} from "@helper/bearer/bearerToken";
import {Service} from "typedi";
import RequestLoggingMiddleware from "@middleware/logging/requestLogger";

@JsonController("/sg/resources/export")
@Service()
export default class PublicationController {
    private static readonly GET_SUBMISSION_ENDPOINT = '/:submissionId'
    private static readonly METADATA_ENDPOINT = '/:submissionId/metadata';

    fileSender: IFileSender = new FileSender();
    bearerVerifier: IBearerTokenVerifier = new BearerTokenVerifier();

    public submissionModel: ISubmissionRepository = SubmissionModel;
    public userModel: IUserRepository = UserModel;

    /**
     * Endpoint to get a submission (in the supergroup format).
     * @param submissionHeader The submission header.
     * @param submissionId The ID of the submission.
     * @param res The response.
     */
    @Get(PublicationController.GET_SUBMISSION_ENDPOINT)
    @UseBefore(RequestLoggingMiddleware)
    public async getSubmission(@HeaderParams() submissionHeader: GetSubmissionHeader,
                               @Param("submissionId") submissionId: string,
                               @Res() res: Response) {

        if (!await this.bearerVerifier.verifyBearerToken(submissionHeader.authorization))
            throw new UnauthorizedError("user is not authorized");

        const submission = await this.submissionModel.getOne({ directory: submissionId });
        if (!submission) {
            throw new BadRequestError("malformed request");
        }

        try {
            await submission.performValidation();
        } catch (e) {
            throw new NotFoundError("the submission could not be found");
        }

        const { "content-type": contentType } = submissionHeader;
        return await this.fileSender.sendFile(submission.getPath(), submission, res, contentType);
    }

    /**
     * Endpoint to get the metadata of a submission in the supergroup
     * format.
     * @param metadataHeader The metadata header.
     * @param submissionId The ID of the submission.
     */
    @Get(PublicationController.METADATA_ENDPOINT)
    @UseBefore(RequestLoggingMiddleware)
    public async getMetadata(@HeaderParams() metadataHeader: GetMetadataHeader,
                             @Param("submissionId") submissionId: string) {

        if (!await this.bearerVerifier.verifyBearerToken(metadataHeader.authorization)) {
            throw new UnauthorizedError("stale request");
        }

        const submission = await this.submissionModel.getOneAndPopulate({ directory: submissionId });
        if (!submission) {
            throw new BadRequestError("malformed request");
        }

        const author = await this.userModel.getOne({ _id: submission.author });
        if (!author) {
            throw new BadRequestError("malformed request");
        }

        const reviews = await submission.getReviews();
        const apiComments = reviews.map(review => review.comments.map(comment =>
            ApiSGComment.createApiSgCommentFromDocument(comment, comment.commenter as IUser)));

        const apiReviews = reviews.map((review, i) => {
            return {
                owner: (review.owner as any).id,
                createdAt: (review as any).created_at.getTime(),
                comments: apiComments[i]
            };
        });

        const coAuthors = submission.coAuthors as IUser[];

        let publication: ApiSGPublication = {
                name: submission.getLatestVersion().fileName,
                title: submission.title,
                owner: author.id,
                introduction: submission.description,
                revision: submission.getLatestVersion().version,
                collaborators: coAuthors.map(author => author.id)
        }

        return {
            status: 'ok',
            publication,
            reviews: apiReviews
        };
    }
}