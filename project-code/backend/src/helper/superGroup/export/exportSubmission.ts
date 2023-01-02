import axios from "axios";
import { config } from "@config/config";
import jwt from "jsonwebtoken";

export interface IExportSubmission {
    generateExportToken(submissionId: string): Promise<string>;
    exportSubmission(url: string, submissionId: string, token: string): Promise<boolean>;
}

export class SubmissionExporter implements IExportSubmission {

    /**
     * Exports a submission to another journal.
     * @param url The URL of the journal to export to.
     * @param submissionId The ID of the submission to be exported.
     * @param token The export token.
     * @returns Promise that resolves with whether the export was successful.
     */
    exportSubmission(url: string, submissionId: string, token: string): Promise<boolean> {
        const importUrl = `${url}/api/sg/resources/import`;
        return new Promise(res => {
            axios.post(importUrl,{}, {
                params: {
                    from: config.journalUrl,
                    id: submissionId,
                    token
                }
            }).then(response => {
                res(response.status == 200);
            }).catch(_ => res(false));
        });
    }

    /**
     * Generates an export JWT token.
     * @param submissionId The ID of the submission.
     * @returns Promise that resolves with the export token or rejects with
     * the error.
     */
    generateExportToken(submissionId: string): Promise<string> {
        return new Promise((res, rej) => {
            jwt.sign({ id: submissionId },
                process.env.JWT_SECRET as string, { expiresIn: '10m' }, (err, token) => {
                    if (err || token === undefined) rej(err);
                    res(token as string);
                });
        });
    }
}

