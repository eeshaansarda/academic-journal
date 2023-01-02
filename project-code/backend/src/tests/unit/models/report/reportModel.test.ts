import {describe} from "mocha";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {ReportModel} from "@models/report/reportModel";
import {expect} from "chai";
import {createReportModel, generateValidUserModel} from "@tests/seed/fakeModels";
import {ReportStatus} from "@validation/body/apiReport";
import {Multer} from "multer";
import {IUser} from "@models/user/userModel";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});

describe("Report Model Tests", () => {
    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    describe("getActiveReports Tests", async () => {
        it("returns an empty list if there are no active reports", async () => {
            const activeReports = await ReportModel.getActiveReports(0);
            expect(activeReports).to.be.empty;
        });

        it("returns all of the active reports if the number of active reports is less than the page size", async () => {
            const reporter = generateValidUserModel();
            await reporter.save();
            const subject = generateValidUserModel();
            await subject.save();

            const activeReports = Array.from(Array(6)).map(_ => createReportModel(subject, reporter));
            const nonActiveReports = Array.from(Array(6)).map(_ => createReportModel(subject, reporter, ReportStatus.RESOLVED));
            const reports = [...activeReports, ...nonActiveReports];

            for (const report of reports) {
                await report.save();
            }

            expect((await ReportModel.getActiveReports(0)).length).to.be.eql(6);
        });

        it("returns a number of reports equal to the page size if the page size is smaller than the number of reports", async () => {
            const reporter = generateValidUserModel();
            await reporter.save();
            const subject = generateValidUserModel();
            await subject.save();

            const activeReports = Array.from(Array(12)).map(_ => createReportModel(subject, reporter));
            const nonActiveReports = Array.from(Array(6)).map(_ => createReportModel(subject, reporter, ReportStatus.RESOLVED));
            const reports = [...activeReports, ...nonActiveReports];

            for (const report of reports) {
                await report.save();
            }

            expect((await ReportModel.getActiveReports(0)).length).to.be.eql(10);
        });

        it("returns the last page", async () => {
            const reporter = generateValidUserModel();
            await reporter.save();
            const subject = generateValidUserModel();
            await subject.save();

            const activeReports = Array.from(Array(15)).map(_ => createReportModel(subject, reporter));
            const nonActiveReports = Array.from(Array(6)).map(_ => createReportModel(subject, reporter, ReportStatus.RESOLVED));
            const reports = [...activeReports, ...nonActiveReports];

            for (const report of reports) {
                await report.save();
            }

            expect((await ReportModel.getActiveReports(2)).length).to.be.eql(5);
        });

        it("returns reports that are all active", async () => {
            const reporter = generateValidUserModel();
            await reporter.save();
            const subject = generateValidUserModel();
            await subject.save();

            const activeReports = Array.from(Array(2)).map(_ => createReportModel(subject, reporter));
            const nonActiveReports = Array.from(Array(6)).map(_ => createReportModel(subject, reporter, ReportStatus.RESOLVED));
            const reports = [...activeReports, ...nonActiveReports];

            for (const report of reports) {
                await report.save();
            }

            const returnedReports = await ReportModel.getActiveReports(0);

            expect(returnedReports.map(report => report.id)).to.have.members(activeReports.map(report => report.id));
        });

        it("populates the subject and the reporter", async () => {
            const reporter = generateValidUserModel();
            await reporter.save();
            const subject = generateValidUserModel();
            await subject.save();

            const activeReports = Array.from(Array(2)).map(_ => createReportModel(subject, reporter));
            for (const report of activeReports) {
                await report.save();
            }

            const returnedReports = await ReportModel.getActiveReports(0);
            const subjectAndReporterDefined = returnedReports.every(report => {
                const subjectId = (report.subject as IUser).id;
                const reporterId = (report.reporter as IUser).id;

                return subjectId && reporterId;
            });

            expect(subjectAndReporterDefined).to.be.true;
        });
    });

    describe("getAndPopulateTests", () => {
        it("populates the subject and reporter", async () => {
            const subject = generateValidUserModel();
            const reporter = generateValidUserModel();
            const report = createReportModel(subject, reporter);
            await subject.save(); 
            await reporter.save(); 
            await report.save();

            const reportModel = await ReportModel.getAndPopulate(report.id);
            const subjectAndReporterDefined = (reportModel.subject as IUser).id !== undefined && (reportModel.reporter as IUser).id !== undefined;
            expect(subjectAndReporterDefined).to.be.true;
        });
    });
});