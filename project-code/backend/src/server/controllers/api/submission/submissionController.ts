import {
    Authorized,
    BadRequestError,
    Body,
    BodyParam,
    CurrentUser,
    Delete,
    Get,
    HttpError,
    InternalServerError,
    JsonController,
    NotFoundError,
    Post,
    Put,
    QueryParam,
    QueryParams,
    Res,
    UnauthorizedError,
    UploadedFile,
    UseBefore
} from 'routing-controllers';
import {config} from "@config/config";
import multer from 'multer';
import * as path from "path";
import {Response} from "express";
import {
    AuthorDoesNotExistError,
    ISubmissionRepository,
    ReviewerNotFoundError,
    SubmissionDoesNotExistError,
    SubmissionModel
} from "@models/submission/submissionModel";
import {
    GenericMimeType,
    IZipCompressor,
    IZipExtractor,
    IZipSender,
    ZipCompressor,
    ZipExtractor,
    ZipSender
} from "@helper/zip/zip";
import {IUser, IUserRepository, UserDoesNotExistError, UserModel, UserRole} from "@models/user/userModel";
import {
    ApiAssignReviewers,
    ApiDirectoryEntry,
    ApiIncrementVersion,
    ApiSubmission,
    ApiSubmissionGitHub
} from "@validation/body/apiSubmission";
import {SubmissionQuery} from "@validation/query/submissionQuery";
import {ApiExportSubmission} from "@validation/body/apiExportSubmission";
import {GetFileQuery} from "@validation/query/getFileQuery";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiReview} from "@validation/body/apiReview";
import {IExportSubmission, SubmissionExporter} from "@helper/superGroup/export/exportSubmission";
import sanitizer from "sanitizer";
import {MimeType} from "file-type";
import {ApiAddCoAuthor} from "@validation/body/apiAddCoAuthor";
import {Service} from "typedi";
import NotificationService from "@server/services/notificationService";
import {NotificationType} from "@models/notification/notificationModel";
import {GitHubImporter, IGitHubImporter} from "@helper/github/githubImporter";
import bodyParser from "body-parser";
import SubmissionService from "@server/services/submissionService";
import {IReviewRepository, ReviewModel} from "@models/review/reviewModel";
import {zip} from "lodash";
import SocketService from "@server/services/socketService";

@JsonController('/submission')
@Service()
export default class SubmissionController {
    public static readonly UPLOAD_ENDPOINT = '/upload';
    public static readonly UPLOAD_FROM_GITHUB_ENDPOINT = '/upload/github';
    public static readonly DOWNLOAD_ENDPOINT = '/download';
    public static readonly GET_FILE_ENDPOINT = '/file'
    public static readonly GET_ENTRIES_ENDPOINT = '/getdents';
    public static readonly SUBMISSION_METADATA_ENDPOINT = '/';
    public static readonly GET_REVIEWS_ENDPOINT = '/reviews';
    public static readonly EXPORT_ENDPOINT = '/export';
    public static readonly ASSIGN_REVIEWER_ENDPOINT = '/assign_reviewers';
    public static readonly GET_AUTHOR_SUBMISSIONS = '/my_submissions';
    public static readonly ASSIGN_CO_AUTHOR_ENDPOINT = '/assign_coauthors';
    public static readonly PUBLISH_ENDPOINT = '/publish';
    public static readonly INCREMENT_VERSION = '/increment';
    public static readonly GET_VERSIONS = '/versions';
    public static readonly DELETE_SUBMISSION = "/delete";

    public static readonly MAX_FILE_SIZE = 100 * 1024 * 1024;

    public submissionModel : ISubmissionRepository = SubmissionModel;
    public userModel: IUserRepository = UserModel;
    public reviewModel: IReviewRepository = ReviewModel;

    public zipExtractor : IZipExtractor = new ZipExtractor();
    public zipCompressor : IZipCompressor = new ZipCompressor();
    public zipSender: IZipSender = new ZipSender();
    public submissionExport: IExportSubmission = new SubmissionExporter();
    public gitHubImporter: IGitHubImporter = new GitHubImporter();

    /**
     * Creates a new submission controller.
     * @param notificationService The notification service (injected).
     * @param submissionService The submission service (injected).
     */
    constructor(private notificationService: NotificationService, private submissionService: SubmissionService) {
        this.notificationService ??= new NotificationService(new SocketService());
        this.submissionService ??= new SubmissionService();
    }

    /**
     * Endpoint to upload a new submission.
     * @param submission The request body.
     * @param user The user who made the request.
     * @param file The file attached to the request.
     */
    @Post(SubmissionController.UPLOAD_ENDPOINT)
    @Authorized()
    public async upload(
        @Body() submission: ApiSubmission,
        @CurrentUser({ required: true }) user: SessionUser,
        @UploadedFile("submission", { 
            options: { 
                storage: multer.memoryStorage(),
                limits: { fileSize: SubmissionController.MAX_FILE_SIZE } 
            }, required: true }) file: Express.Multer.File
        ) {
        let submissionId: string;
        try {
            const destination = await this.zipCompressor.compressToZip(file.originalname, file.buffer);

            submissionId = path.parse(destination).name;

            submission.description = sanitizer.sanitize(submission.description);
            submission.submissionId = submissionId;
            submission.author = {
                id: user.id,
                username: user.username
            };

            await this.submissionModel.createSubmission(submission, { filename: file.originalname, destination });
        } catch (e) {
            throw new BadRequestError((e as Error).message);
        }

        return {
            status: "success",
            submissionId
        };
    }

    /**
     * Endpoint to upload a submission from GitHub.
     * @param submission The request body.
     * @param user The user who made the request.
     * @param file The file attached to the request.
     * @returns 
     */
    @UseBefore(bodyParser.urlencoded())
    @Post(SubmissionController.UPLOAD_FROM_GITHUB_ENDPOINT)
    @Authorized()
    public async uploadFromGitHub(@Body() submission: ApiSubmissionGitHub,
                                  @CurrentUser({ required: true }) user: SessionUser,
                                  @UploadedFile("submission") file: any) {
        let buffer;
        try {
            buffer = await this.gitHubImporter.importZip(submission.owner, submission.repoName);
        } catch (e) {
            throw new NotFoundError("could not find the GitHub repo");
        }

        let destination;
        try {
            destination = await this.zipCompressor.compressToZip(submission.repoName, buffer);
        } catch (e) {
            throw new InternalServerError("unable to save zip");
        }

        submission.description = sanitizer.sanitize(submission.description);
        submission.submissionId = path.parse(destination).name;
        submission.author = {
            id: user.id,
            username: user.username
        }

        try {
                await this.submissionModel.createSubmission(submission, { filename: submission.repoName, destination });
        } catch (e) {
            throw new BadRequestError((e as Error).message);
        }

        return {
            status: "success",
            submissionId: submission.submissionId
        };
    }

    /**
     * Endpoint to download a submission.
     * @param submissionQuery The query parameters.
     * @param response The response.
     */
    @Authorized()
    @Get(SubmissionController.DOWNLOAD_ENDPOINT)
    public async download(@QueryParams() submissionQuery: SubmissionQuery,
                          @Res() response: Response) {

        const submission = !submissionQuery.version ?
            await this.submissionModel.getOne({directory: submissionQuery.submissionId})
            : await this.submissionModel.getSubmissionWithVersion(submissionQuery.submissionId, submissionQuery.version);

        if (!submission)
            throw new NotFoundError("the submission specified does not exist");

        try {
            await submission.performValidation();
        } catch (e) {
            throw new NotFoundError("the submission could not be found");
        }

        await this.zipSender.sendZip(submission.getPath(submissionQuery.version), submission, response);
        return response;
    }

    /**
     * Endpoint to export a submission to another journal.
     * @param user The user who made the request.
     * @param exportSubmission The request body.
     */
    @Authorized()
    @Post(SubmissionController.EXPORT_ENDPOINT)
    public async export(@CurrentUser({ required: true }) user: SessionUser,
                        @Body() exportSubmission: ApiExportSubmission) {
        const userModel = await this.userModel.getOne({ id: user.id });

        if (!userModel)
            throw new NotFoundError("the session user could not be found");

        const submission = await this.submissionModel.getOne({ directory: exportSubmission.id });
        if (!submission)
            throw new NotFoundError("the submission could not be found");

        // ensure you can't export someone else's submission
        if (submission.author.toString() !== userModel._id.toString())
            throw new UnauthorizedError("you do not have the permissions to perform that operation");

        const exportToken = await this.submissionExport.generateExportToken(exportSubmission.id);
        const result = await this.submissionExport.exportSubmission(exportSubmission.url, exportSubmission.id, exportToken);

        if (!result)
            throw new HttpError(400,"failed to export the submission");

        return { 
            status: 'success' 
        };
    }

    /**
     * Endpoint to get a file within a submission.
     * @param file The query parameters.
     */
    @Authorized()
    @Get(SubmissionController.GET_FILE_ENDPOINT)
    public async getFile(@QueryParams() file: GetFileQuery) {
        const submission = await this.submissionModel.getOne({ directory: file.submissionId });
        if (!submission)
            throw new NotFoundError("the submission could not be found");

        try {
            await submission.performValidation();
        } catch (e) {
            throw new NotFoundError("the submission does not exist");
        }

        let contentType : MimeType | GenericMimeType;
        let content : string | Blob;

        try {
            [contentType, content] = await this.zipExtractor.getFileAsString(submission.getPath(), file.pathToFile);
        } catch (e) {
            throw new NotFoundError("the file could not be found within the submission");
        }

        return {
            status: 'success',
            file: {
                content,
                contentType,
                fileName: path.basename(file.pathToFile)
            }
        };
    }

    /**
         * Endpoint to get the entries of a directory within a submission.
     * @param file The request body.
     */
    @Authorized()
    @Get(SubmissionController.GET_ENTRIES_ENDPOINT)
    public async getEntries(@QueryParams() file: GetFileQuery) {
        const submission = await this.submissionModel.getOne({directory: file.submissionId});

        if (!submission)
            throw new NotFoundError("the submission could not be found");

        try {
            await submission.performValidation();
        } catch (e) {
            throw new NotFoundError("the submission could not be found");
        }

        let entries: ApiDirectoryEntry[];
        try {
            entries = await this.zipExtractor.getFileEntries(submission.getPath(), file.pathToFile);
        } catch (e) {
            throw new NotFoundError("the file could not be found");
        }

        if (file.reviewId !== undefined) {
            const numCommentsPerEntry = await Promise.all(entries.map(e =>
                this.reviewModel.getNumCommentsForPath(submission, file.reviewId as string, e.fileName)));
            entries = zip(entries, numCommentsPerEntry).map(([entry, numComments]) => ({ ...entry, numComments })) as ApiDirectoryEntry[];
        }

        return {
            status: 'success',
            entries
        };
    }

    /**
     * Endpoint to get the metadata of a submission.
     * @param submissionId The ID of the submission.
     */
    @Authorized()
    @Get(SubmissionController.SUBMISSION_METADATA_ENDPOINT)
    public async getSubmissionMetadata(@QueryParam("submissionId") submissionId: string) {
        let submission = await this.submissionModel.getOneAndPopulate({directory: submissionId});

        if (!submission)
            throw new NotFoundError("the the submission could not be found");

        return {
            status: 'success',
            submission: ApiSubmission.createApiSubmissionFromDocument(submission)
        };
    }

    /**
     * Endpoint to get a list of reviews on a submission.
     * @param submissionId The ID of the submission.
     * @param sessionUser The user who made the request.
     */
    @Authorized()
    @Get(SubmissionController.GET_REVIEWS_ENDPOINT)
    public async getReviews(@QueryParam("submissionId", { required: true }) submissionId: string,
                            @CurrentUser({ required: true }) sessionUser: SessionUser) {
        const submission = await this.submissionModel.getOne({directory: submissionId});

        if (!submission)
            throw new NotFoundError("the submission does not exist");

        let reviewsDocs = (await submission.allReviewsSubmitted()) ? await submission.getReviews() :
            await submission.getReviewsForUser(sessionUser.id);

        const apiReviews = reviewsDocs.map(document => {
            return ApiReview.createApiReviewFromDocument(document);
        });

        return {
            status: 'success',
            reviews: apiReviews
        };
    }

    /**
     * Endpoint to assign a new reviewer to a submission. Editor only.
     * @param assignReviewer The request body.
     */
    @Authorized(UserRole.EDITOR)
    @Put(SubmissionController.ASSIGN_REVIEWER_ENDPOINT)
    public async assignReviewers(@Body() assignReviewer : ApiAssignReviewers) {
        try {
            await this.submissionModel.assignReviewers(assignReviewer.submissionId, assignReviewer.reviewers);
        } catch (e) {
            if (e instanceof ReviewerNotFoundError || e instanceof SubmissionDoesNotExistError)
                throw new NotFoundError((e as Error).message);
            throw new BadRequestError((e as Error).message);
        }

        // inform the new reviewers that they have been assigned
        const submissionUrl = `${config.journalUrl}/submission/${assignReviewer.submissionId}`;
        this.notificationService.pushNotificationForUsers(`You have been assigned as a reviewer on a submission`,
            assignReviewer.reviewers, NotificationType.REVIEW, submissionUrl);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to assign co-authors to a submission.
     * @param addCoAuthor The request body.
     * @param user The user who made the request.
     */
    @Authorized()
    @Put(SubmissionController.ASSIGN_CO_AUTHOR_ENDPOINT)
    public async assignCoAuthors(@Body() addCoAuthor: ApiAddCoAuthor,
                                 @CurrentUser({ required: true }) user : SessionUser) {
        try {
            await this.submissionModel.assignCoAuthors(addCoAuthor.submissionId, addCoAuthor.userIds);
        } catch (e) {
            const message = (e as Error).message;
            if (e instanceof SubmissionDoesNotExistError || e instanceof AuthorDoesNotExistError)
                throw new NotFoundError(message);

            throw new BadRequestError(message);
        }

        // assign the new co-authors that they have been assigned
        const submissionUrl = `${config.journalUrl}/submission/${addCoAuthor.submissionId}`;
        this.notificationService.pushNotificationForUsers(`You have been assigned as a co-author on a submission`, addCoAuthor.userIds, NotificationType.SUBMISSION, submissionUrl);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to publish a submission. Editor only.
     * @param submissionId The ID of the submission.
     * @param user The user who made the request.
     */
    @Authorized(UserRole.EDITOR)
    @Put(SubmissionController.PUBLISH_ENDPOINT)
    public async publish(@BodyParam("submissionId", { required: true }) submissionId: string,
                         @CurrentUser({ required: true }) user : SessionUser) {
        try {
            await this.submissionModel.publish(submissionId);
        } catch (e) {
            throw new BadRequestError((e as Error).message);
        }

        const submission = await this.submissionModel.getOneAndPopulate({ directory: submissionId });

        if (!submission)
            throw new NotFoundError("the submission does not exist");

        // inform authors their submissions has been published
        this.notificationService.pushNotificationForUsers(`Your submission has been published`,
            submission.getAuthorIds(), NotificationType.SUBMISSION);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to add a new version of a submission.
     * @param incrementVersion The request body.
     * @param user The user who made the request.
     * @param file The file attached to the request.
     */
    @Authorized()
    @Put(SubmissionController.INCREMENT_VERSION)
    public async incrementVersion(@Body() incrementVersion: ApiIncrementVersion,
                                  @CurrentUser({ required: true }) user: SessionUser,
                                  @UploadedFile("submission", { options: { storage: multer.memoryStorage(),
                                    limits: { fileSize: SubmissionController.MAX_FILE_SIZE } }, required: true, }) file: Express.Multer.File) {
        const submission = await this.submissionModel.getOneAndPopulate({directory: incrementVersion.submissionId});

        if (!submission)
            throw new NotFoundError("the given submission does not exist");

        if (!submission.assertAuthor(user.id))
            throw new UnauthorizedError("user is not the author of the submission");

        const destination = await this.zipCompressor.compressToZip(file.originalname, file.buffer);

        try {
            await submission.incrementVersion(incrementVersion.version, { filename: file.originalname, destination });
        } catch (e) {
            throw new BadRequestError((e as Error).message);
        }

        // notify all reviewers there is a new version
        const versionsUrl = `${config.journalUrl}/submission/${submission.id}/versions`;
        this.notificationService.pushNotificationForUsers(`${submission.title} has a new version`,
            submission.reviewers.map(r => (r as IUser).id), NotificationType.REVIEW, versionsUrl);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to get a list of versions of a submission.
     * @param submissionId The ID of the submission.
     */
    @Authorized()
    @Get(SubmissionController.GET_VERSIONS)
    public async getVersions(@QueryParam("submissionId", { required: true }) submissionId: string) {
        const submission = await SubmissionModel.getOne({ directory: submissionId });

        if (!submission)
            throw new NotFoundError("the submission does not exist");

        return {
            status: "success",
            versions: submission.versions.map(v => v.version)
        };
    }

    /**
     * Endpoint to delete a submission.
     * @param submissionId The ID of the submission.
     * @param sessionUser The user who made the request.
     */
    @Authorized()
    @Delete(SubmissionController.DELETE_SUBMISSION)
    public async deleteSubmission(@QueryParam("submissionId", { required: true }) submissionId: string,
                                  @CurrentUser({ required: true }) sessionUser: SessionUser) {
        const submission = await this.submissionModel.getOneAndPopulate({directory: submissionId});

        if (!submission)
            throw new SubmissionDoesNotExistError("the given submission does not exist");

        if (!submission.assertAuthor(sessionUser.id))
            throw new UnauthorizedError("you must be the author to delete the submission");

        const supportingDocuments = submission.supportingDocuments;
        const versions = submission.versions;


        try {
            await this.submissionModel.removeOne({directory: submissionId});
        } catch (e) {
            if (e instanceof SubmissionDoesNotExistError) {
                throw new NotFoundError(e.message);
            }
            throw new BadRequestError((e as Error).message);
        }

        this.submissionService.deleteSubmission({
            supportingDocuments,
            versions
        })

        return {
            status: "success"
        };
    }
}