import {ISubmission} from "@models/submission/submissionModel";
import {Response} from "express";
import fs from "fs";

export enum ContentType {
    ZIP = "application/zip",
    FILE = "text/plain"
}

export interface IFileSender {
    sendFile(pathToZip: string, submission: ISubmission, res: Response, type: ContentType): Promise<Response>;
}

export class FileSender implements IFileSender {

    /**
     * Sends a file to a given response.
     * @param pathToZip The path to the submission zip file.
     * @param submission The submission.
     * @param res The response.
     * @param contentType The content type of the file.
     * @returns Promise that resolves with the response data or rejects with the error.
     */
    public async sendFile(pathToZip: string, submission: ISubmission, res: Response, contentType: ContentType) {
        return new Promise((res, rej) => {
            fs.readFile(pathToZip, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            });
        }).then(data => {
            const buf = data as Buffer;

            res.set('Content-Type', contentType);
            res.set('Content-Disposition', `attachment;`);
            res.set('Content-Length', buf.length.toString());
            res.status(200).end(buf, 'binary');
            return res;
        });
    }
}