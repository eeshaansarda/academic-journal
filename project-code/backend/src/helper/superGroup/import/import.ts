import {IUser} from "@models/user/userModel";
import {ApiSgUserSchema} from "@validation/body/apiSgUser";
import * as mappings from "@config/super_groups.json";
import axios from "axios";
import { config } from "@config/config";
import fs from "fs";

export interface ImportedSubmission {
    publication: ImportedPublication;
    reviews: ImportedReview[];
}

export interface ImportedPublication {
    name: string;
    title: string;
    owner: string;
    introduction: string
    revision: string;
    collaborators: string[];
}

export interface ImportedReview {
    owner: string;
    createdAt: number;
    comments: ImportedComment[];
}

export interface ImportedComment {
    id: number;
    replying: number | undefined;
    filename: string;
    anchor: {
        start: number,
        end: number
    }
    contents: string;
    author: string;
    postedAt: number;
}

interface ISsoUserImporter {
    importSsoUser(userId: string): Promise<IUser & { _id: any } | null>;
    getSsoUser(userId: string): Promise<ApiSgUserSchema | null>;
}

export class SsoUserImporter implements ISsoUserImporter {

    /**
     * Gets the details of an SSO user.
     * @param userId The ID of the user.
     * @returns Promise that resolves with the user details or rejects if the
     * user did not exist.
     */
    public getSsoUser(userId: string): Promise<ApiSgUserSchema | null> {
        return new Promise<ApiSgUserSchema | null>((res, rej) => {
            const team = userId.slice(-3);
            const url = (mappings.sgMappings as { [key: string]: string })[team];

            if (!url)
                return rej(null);

            const userUrl = new URL(url);
            userUrl.pathname = `api/sg/users/${userId}`;

            axios.get(userUrl.toString()).then(response => {
                if (response.data && response.data.status === "ok") {
                    return res({
                        name: response.data.name,
                        email: response.data.email,
                        id: response.data.id
                    });
                }
                rej(null);
            }).catch(() => rej(null));
        });
    }

    /**
     * Imports an SSO user from another journal.
     * @param userId The ID of the user.
     * @returns Promise that resolves with the imported user.
     */
    public async importSsoUser(userId: string): Promise<(IUser & { _id: any }) | null> {
        const user = await this.getSsoUser(userId);

        if (user === null) {
            return null;
        }

        let userModel = ApiSgUserSchema.convertToUserModel(user);

        try {
            await userModel.save();
        } catch (e) {
            return null;
        }

        return userModel as IUser & { _id: any };
    }
}

export interface ISsoSubmission {
    saveSubmission(binary: string, submissionId: string): Promise<void>;
    getSubmission(baseUrl: string, submissionId: string, token: string): Promise<string | null>;
    getSubmissionMetadata(baseUrl: string, submissionId: string, token: string): Promise<ImportedSubmission | undefined>;
}

export class SsoSubmission implements ISsoSubmission {

    /**
     * Saves a submission to file.
     * @param binary The binary content of the submission.
     * @param submissionId The ID of the submission.
     */
    public async saveSubmission(binary: string, submissionId: string): Promise<void> {
        const pathToFile = `${config.baseSubmissionFolder}/${submissionId}.zip`;
        await fs.promises.writeFile(pathToFile, binary, 'binary');
    }

    /**
     * Gets a submission from another journal.
     * @param baseUrl The base URL of the other journal.
     * @param submissionId The ID of the submission.
     * @param token The export token.
     * @returns Promise that resolves with the content of the submission or
     * rejects with the error.
     */
    public getSubmission(baseUrl: string, submissionId: string, token: string): Promise<string | null> {
        const submissionUrl = `${baseUrl}/api/sg/resources/export/${submissionId}`;
        return new Promise(res => {
            axios.get(submissionUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/zip'
                },
                params: {
                    from: config.journalUrl
                },
                responseType: "arraybuffer"
            }).then(async response => {
                if (response.status === 200) {
                    res(response.data);
                } else {
                    res(null);
                }
            }).catch(_ => res(null));
        });
    }

    /**
     * Gets the metadata of a submission from another journal.
     * @param baseUrl The base URL of the other journal.
     * @param submissionId The ID of the submission.
     * @param token The import/export token.
     * @returns Promise that resolves with the metadata or rejects with the
     * error.
     */
    public getSubmissionMetadata(baseUrl: string, submissionId: string, token: string): Promise<ImportedSubmission | undefined> {
        const metadataUrl = `${baseUrl}/api/sg/resources/export/${submissionId}/metadata`;
        return new Promise(res => {
            axios.get(metadataUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    from: config.journalUrl
                }
            }).then(response => {
                if (response.data.status && response.data.status == 'ok') {
                    res(response.data);
                } else {
                    res(undefined);
                }
            }).catch(_ => res(undefined));
        });
    }
}
