import {IsDefined} from "class-validator";
import {IReport} from "@models/report/reportModel";
import {IUser} from "@models/user/userModel";

/**
 * Represents a report filed against a user.
 */
export class ApiReport {
    @IsDefined()
    id: string;

    @IsDefined()
    reason: string;

    subject: { username: string, id: string };

    reporter: { username: string, id: string };

    /**
     * Creates a report (to be returned from the API) from a stored report.
     * @param report The stored report.
     * @returns The report.
     */
    public static createApiReportFromDocument(report: IReport): ApiReport {
        const subject = report.subject as IUser;
        const reporter = report.reporter as IUser

        return {
            id: report.id,
            reason: report.reason,
            subject: { id: subject.id, username: subject.username },
            reporter: { id: reporter.id, username: reporter.username }
        };
    }
}

export enum ReportStatus {
    RESOLVED = "resolved",
    ACTIVE = "active"
}