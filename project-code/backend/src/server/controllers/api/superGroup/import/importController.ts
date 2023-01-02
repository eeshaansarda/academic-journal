import {ISubmissionRepository, SubmissionModel} from "@models/submission/submissionModel";
import {IUserRepository, UserModel} from "@models/user/userModel";
import {BadRequestError, JsonController, Post, QueryParams, UseBefore} from "routing-controllers";
import {PostImportSubmissionQuery} from "@validation/query/postImportSubmissionQuery";
import {ISsoSubmission, SsoSubmission} from "@helper/superGroup/import/import";
import {Service} from "typedi";
import RequestLoggingMiddleware from "@middleware/logging/requestLogger";

@JsonController("/sg/resources/import")
@Service()
export default class ImportController {
    private static readonly IMPORT_SUBMISSION_ENDPOINT = '/';

    public userModel : IUserRepository = UserModel;
    public submissionModel : ISubmissionRepository = SubmissionModel;
    public ssoSubmission: ISsoSubmission = new SsoSubmission();

    /**
     * Endpoint to import a submission from another journal.
     * @param importQuery The query parameters.
     */
    @Post(ImportController.IMPORT_SUBMISSION_ENDPOINT)
    @UseBefore(RequestLoggingMiddleware)
    public async importSubmission(@QueryParams() importQuery: PostImportSubmissionQuery) {
        // In the future not immediately storing the file may be a 
        // performance issue but for now it is better to get it right.
        const receivedBinary = await this.ssoSubmission.getSubmission(importQuery.from, importQuery.id, importQuery.token);
        if (receivedBinary === null) {
            throw new BadRequestError("malformed request");
        }

        const metadata = await this.ssoSubmission.getSubmissionMetadata(importQuery.from, importQuery.id, importQuery.token);
        if (!metadata) {
            throw new BadRequestError("malformed request");
        }

        let submission = await this.submissionModel.importSubmission(metadata);
        await this.ssoSubmission.saveSubmission(receivedBinary, submission.directory);

        return {
            status: "ok",
            submissionId: submission.directory
        };
    }
}