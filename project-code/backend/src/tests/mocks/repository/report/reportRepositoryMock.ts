import BaseRepositoryMock from "@mocks/repository/baseRepositoryMock";
import {IReport, IReportRepository} from "@models/report/reportModel";
import sinon from "sinon";

export default class ReportRepositoryMock extends BaseRepositoryMock<IReport> implements IReportRepository {
    countActiveReports = sinon.stub();
    getActiveReports = sinon.stub();
    getAndPopulate = sinon.stub();
    setResolved = sinon.stub();
}