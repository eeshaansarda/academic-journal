import {Get, Controller, QueryParams, Authorized, CurrentUser, QueryParam} from "routing-controllers";
import {ISubmissionRepository, SubmissionModel} from "@models/submission/submissionModel";
import {SubmissionsQuery} from "@validation/query/submissionsQuery";
import {ApiSubmission} from "@validation/body/apiSubmission";
import {IUserRepository, UserModel} from "@models/user/userModel";
import {SessionUser} from "@validation/session/SessionUser";
import {Service} from "typedi";

@Controller('/submissions')
@Service()
export default class SubmissionsController {
    public submissionModel: ISubmissionRepository = SubmissionModel;
    public userModel: IUserRepository = UserModel;

    public static readonly GET_SUBMISSIONS = "/";
    public static readonly GET_AUTHOR_SUBMISSIONS = "/my_submissions";
    public static readonly GET_SUBMISSIONS_WITH_NO_REVIEWERS = "/no_reviewers";

    /**
     * Endpoint to get a list of submissions.
     * @param query The query parameters.
     */
    @Authorized()
    @Get(SubmissionsController.GET_SUBMISSIONS)
    public async getSubmissions(@QueryParams() query: SubmissionsQuery) {
        const [numSubmissions, retrievedSubmissions] = await this.submissionModel.findByTitle(query);

        const apiSubmissions = retrievedSubmissions
            .filter(s => !!s.author)
            .map(submission => ApiSubmission.createApiSubmissionFromDocument(submission));

        return {
            status: 'success',
            submissions: apiSubmissions,
            numSubmissions
        };
    }

    /**
     * Endpoint to get a list of submissions by a specific author.
     * @param sessionUser The user who made the request.
     * @param query The query parameters.
     */
    @Authorized()
    @Get(SubmissionsController.GET_AUTHOR_SUBMISSIONS)
    public async getSubmissionsForCurrentUser(@CurrentUser({ required: true }) sessionUser : SessionUser,
                                              @QueryParams() query: SubmissionsQuery) {
        query = {...query, userId: sessionUser.id};

        const [numSubmissions, retrievedSubmissions] = await this.submissionModel.findByTitle(query);

        const apiSubmissions = retrievedSubmissions.map(submission => {
            return ApiSubmission.createApiSubmissionFromDocument(submission);
        });

        return {
            status: 'success',
            submissions: apiSubmissions,
            numSubmissions
        };
    }

    /**
     * Endpoint to get a list of submissions with no reviewers assigned.
     * @param sessionUser The user who made the request.
     * @param pageNumber The page number.
     */
    @Authorized()
    @Get(SubmissionsController.GET_SUBMISSIONS_WITH_NO_REVIEWERS)
    public async getSubmissionsWithNoReviewers(@CurrentUser({ required: true }) sessionUser: SessionUser,
                                               @QueryParam("pageNumber", { required: true }) pageNumber: number) {
        const [numSubmissions, submissions] = await this.submissionModel.getSubmissionsWithNoReviewers(pageNumber);

        const apiSubmissions = submissions.map(ApiSubmission.createApiSubmissionFromDocument);

        return {
            status: "success",
            submissions: apiSubmissions,
            numSubmissions
        };
    }
}