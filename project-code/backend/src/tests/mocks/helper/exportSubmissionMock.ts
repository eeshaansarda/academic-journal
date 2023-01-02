import {IExportSubmission} from "@helper/superGroup/export/exportSubmission";
import sinon from "sinon";

export class ExportSubmissionMock implements IExportSubmission {
    exportSubmission = sinon.stub();
    generateExportToken = sinon.stub();
}