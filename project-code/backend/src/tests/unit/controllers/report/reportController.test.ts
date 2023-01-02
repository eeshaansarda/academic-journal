import {describe} from "mocha";
import ReportController from "@controllers/api/report/reportController";
import {UserLookUpRepository} from "@mocks/repository/user/userRepositoryMock";
import ReportRepositoryMock from "@mocks/repository/report/reportRepositoryMock";
import sinon from "sinon";
import {
    createApiReportBan, createPopulatedReport, createSessionUser, createViewReportsQuery,
    generateApiReport,
    generateFakeUser
} from "@tests/seed/fakeData";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, NotFoundError} from "routing-controllers";
import {Multer} from "multer";
import {expect} from "chai";
import BanRepositoryMock from "@mocks/repository/ban/banRepositoryMock";
import {v4} from "uuid";
import {ApiReport, ReportStatus} from "@validation/body/apiReport";

describe("Report Controller Tests", () => {
    let reportController : ReportController;
    let userRepository : UserLookUpRepository;
    let reportRepository : ReportRepositoryMock;
    let banRepository : BanRepositoryMock;

    beforeEach(() => {
        reportController = new ReportController();
        reportController.userModel = userRepository = new UserLookUpRepository();
        reportController.reportModel = reportRepository = new ReportRepositoryMock();
        reportController.banModel = banRepository = new BanRepositoryMock();
    });

    describe("Submit Report Endpoint Tests", () => {
        it("if the user being reported does not exist it throws a NotFoundError", async () => {
            const report = generateApiReport();
            const currentUser = createSessionUser();

            await userRepository.create([currentUser])

            await expectThrowsAsync(NotFoundError,
                async () => await reportController.submitReport(report, currentUser));
        });

        it("if an error occurred when attempting to create the report then a BadRequest error is thrown", async () => {
            const report = generateApiReport();
            const reported = generateFakeUser();
            const currentUser = createSessionUser();
            report.id = reported.id;

            await userRepository.create([currentUser, reported]);
            reportRepository.createOne.throws(Error);

            await expectThrowsAsync(BadRequestError,
                async () => await reportController.submitReport(report, currentUser));
        });

        it("return success and the reportid if the report was successfully created", async () => {
            const report = generateApiReport();
            const reported = generateFakeUser();
            const currentUser = createSessionUser();
            const reporter = generateFakeUser();
            reporter.id = currentUser.id;

            report.id = reported.id;

            reportRepository.createOne.returns({
                id: v4(),
                status: ReportStatus.ACTIVE,
                subject: reported._id,
                reporter: reporter._id
            });
            await userRepository.create([reporter, reported]);

            const result = await reportController.submitReport(report, currentUser);

            expect(result.status).to.be.eql("success");
        });
    });

    describe("banReport endpoint tests", () => {
        it("throws a NotFoundError if the report specified does not exist", async () => {
            const apiBan = createApiReportBan();
            const sessionUser = createSessionUser();
            const adminUser = generateFakeUser();
            adminUser.id = sessionUser.id;

            await userRepository.create([adminUser]);

            reportRepository.getAndPopulate.returns(null);

            await expectThrowsAsync(NotFoundError,
                async () => await reportController.banReport(apiBan, sessionUser));

        });

        it("throws a BadRequestError if we could not create a ban", async () => {
            const apiBan = createApiReportBan();
            const sessionUser = createSessionUser();

            const admin = generateFakeUser();
            admin.id = sessionUser.id;

            const toBan = generateFakeUser();

            const report = createPopulatedReport();
            report.subject = toBan;

            await userRepository.create([admin])

            reportRepository.getAndPopulate.returns(report);
            banRepository.createOne.throws(Error);

            await expectThrowsAsync(BadRequestError, async () => {
                await reportController.banReport(apiBan, sessionUser);
            });
        });

        it("returns success if the ban is valid", async () => {
            const apiBan = createApiReportBan();
            const sessionUser = createSessionUser();

            const admin = generateFakeUser();
            admin.id = sessionUser.id;

            const toBan = generateFakeUser();

            const report = createPopulatedReport();
            report.subject = toBan;
            banRepository.createOne.returns({
                reason: apiBan.reason,
                subject: report.subject._id,
                issuer: report.reporter._id,
                expiry: apiBan.expiry
            });

            await userRepository.create([admin]);

            reportRepository.getAndPopulate.returns(report);

            const response = await reportController.banReport(apiBan, sessionUser);

            expect(report.status).to.be.eql(ReportStatus.RESOLVED);
            expect(response.status).to.be.eql('success');
        });
    });

    describe("dismissReportEndpoint tests", () => {
        it("throws an error if the report specified does not exist", async () => {
            const id = v4();
            reportRepository.getOne.returns(null);

            await expectThrowsAsync(NotFoundError,
                async () => await reportController.dismissReport(id));
        });


        it("sets the report to resolved and return success", async () => {
            const report = createPopulatedReport();
            const id = v4();

            reportRepository.getOne.returns(report);
            const result = await reportController.dismissReport(id);

            expect(report.status).to.be.eql(ReportStatus.RESOLVED);
            expect(result.status).to.be.eql("success");
        });
    });

    describe("viewReportsEndpoint tests", () => {
        it("returns an empty list when there are no active reports", async () => {
            reportRepository.getActiveReports.returns([]);
            reportRepository.countActiveReports.returns(0);

            const result = await reportController.viewReports(createViewReportsQuery(), createSessionUser());
            expect(result).to.be.eql({
                status: "success",
                reports: [],
                numReports: 0
            });
        });

        it("returns a list of active reports on success", async () => {
            const reports = [createPopulatedReport(), createPopulatedReport()];
            const apiReports = reports.map(report => ApiReport.createApiReportFromDocument(report as any));

            reportRepository.getActiveReports.returns(reports);
            reportRepository.countActiveReports.returns(reports.length);
            const result = await reportController.viewReports(createViewReportsQuery(), createSessionUser());

            expect(result).to.be.eql({
                status: "success",
                reports: apiReports,
                numReports: reports.length
            });
        })
    });

    afterEach(() => {
        sinon.restore();
    });
});