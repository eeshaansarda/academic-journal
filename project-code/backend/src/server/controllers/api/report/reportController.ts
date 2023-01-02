import {IReportRepository, ReportModel} from "@models/report/reportModel";
import {IUser, IUserRepository, UserModel, UserRole} from "@models/user/userModel";
import {BanModel, IBanRepository} from "@models/ban/banModel";
import {
    Authorized,
    BadRequestError,
    Body,
    BodyParam,
    CurrentUser, Get,
    JsonController,
    NotFoundError,
    Post, QueryParams
} from "routing-controllers";
import {ApiReport, ReportStatus} from "@validation/body/apiReport";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiReportBan} from "@validation/body/apiBan";
import {ViewReportsQuery} from "@validation/query/viewReportsQuery";
import {Service} from "typedi";

@JsonController("/report")
@Service()
export default class ReportController {
    private static readonly SUBMIT_REPORT_ENDPOINT = "/submit";
    private static readonly BAN_REPORT_ENDPOINT = "/ban";
    private static readonly DISMISS_REPORT_ENDPOINT = "/dismiss";
    private static readonly VIEW_REPORTS_ENDPOINT = "/view_reports";

    public reportModel: IReportRepository = ReportModel;
    public userModel: IUserRepository = UserModel;
    public banModel: IBanRepository = BanModel;

    /**
     * Endpoint to report a user.
     * @param report The request body.
     * @param reporter The user who made the request.
     */
    @Post(ReportController.SUBMIT_REPORT_ENDPOINT)
    @Authorized()
    public async submitReport(@Body() report: ApiReport,
                              @CurrentUser({ required: true }) reporter: SessionUser) {
        const userModel = await this.userModel.getOne({ id: report.id });
        if (!userModel)
            throw new NotFoundError("user specified does not exist");

        const reporterModel = await this.userModel.getOne({ id: reporter.id });
        if (!reporterModel)
            throw new NotFoundError("session user does not exist");

        try {
            const reportModel = await this.reportModel.createOne({
                reason: report.reason,
                status: ReportStatus.ACTIVE,
                subject: userModel._id,
                reporter: reporterModel._id
            });

            return {
                status: 'success',
                reportId: reportModel.id
            };
        } catch (err) {
            throw new BadRequestError("the request was not in the correct format");
        }
    }

    /**
     * Endpoint to ban a user. Admin only.
     * @param apiBan The request body.
     * @param adminUser The user who made the request.
     */
    @Post(ReportController.BAN_REPORT_ENDPOINT)
    @Authorized(UserRole.ADMIN)
    public async banReport(@Body() apiBan: ApiReportBan,
                           @CurrentUser({ required: true }) adminUser: SessionUser) {

        const adminUserModel = await this.userModel.getOne({ id: adminUser.id });
        if (!adminUserModel)
            throw new NotFoundError("session user does not exist");

        const reportModel = await this.reportModel.getAndPopulate(apiBan.reportId);
        if (!reportModel)
            throw new NotFoundError("the report does not exist");

        reportModel.status = ReportStatus.RESOLVED;
        await reportModel.save();

        const userModel = reportModel.subject as IUser;

        try {
            let banModel = await this.banModel.createOne({
                reason: apiBan.reason,
                subject: userModel._id,
                issuer: adminUserModel._id,
                expiry: apiBan.expiry as any
            });

            await userModel.save();

            return {
                status: 'success',
                banId: banModel.id
            };
        } catch (err) {
            throw new BadRequestError("ban is an incorrect format");
        }
    }

    /**
     * Endpoint to dismiss a report. Admin only.
     * @param reportId The ID of the report.
     */
    @Post(ReportController.DISMISS_REPORT_ENDPOINT)
    @Authorized(UserRole.ADMIN)
    public async dismissReport(@BodyParam("id", { required: true }) reportId: string) {
        const report = await this.reportModel.getOne({ id: reportId });
        if (!report)
            throw new NotFoundError("report does not exist");

        report.status = ReportStatus.RESOLVED;
        await report.save();

        return {
            status: 'success'
        };
    }

    /**
     * Endpoint to get a list of reports. Admin only.
     * @param viewReportsQuery The query parameters.
     * @param user The user who made the request.
     */
    @Get(ReportController.VIEW_REPORTS_ENDPOINT)
    @Authorized(UserRole.ADMIN)
    public async viewReports(@QueryParams() viewReportsQuery: ViewReportsQuery,
                             @CurrentUser() user: SessionUser) {
        const reports = await this.reportModel.getActiveReports(viewReportsQuery.pageNumber);

        const apiReports = reports.map(report => ApiReport.createApiReportFromDocument(report));
        const numReports = await this.reportModel.countActiveReports();

        return {
            status: "success",
            reports: apiReports,
            numReports
        };
    }
}