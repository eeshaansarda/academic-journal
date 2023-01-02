import fs from "fs";
import path from "path";
import {ApiDirectoryEntry} from "@validation/body/apiSubmission";
import FileType from "file-type";
import {v4 as uuidv4} from "uuid";
import { config } from "@config/config";
import JSZip from "jszip";
import {ISubmission} from "@models/submission/submissionModel";
import {Response} from "express";
import {MimeType} from "file-type";
import * as util from "util";


export interface IZipExtractor {
    getFileEntries(zipFile: string, pathInZip: string): Promise<ApiDirectoryEntry[]>;
    getFileAsString(zipFile: string, pathInZip: string): Promise<[GenericMimeType | MimeType, string]>;
    deleteZip(zipFile: string): Promise<void>;
}

export interface IZipCompressor {
    compressToZip(originalname: string, buffer: any): Promise<string>;
}

export interface IZipSender {
    sendZip(pathToFile: string, submission: ISubmission, res: Response): Promise<Response>
}

export enum GenericMimeType {
    TEXT = "text/plain",
    BINARY = "application/octet-stream"
}

const unlinkFile = util.promisify(fs.unlink);

export class ZipExtractor implements IZipExtractor {

    /**
     * Returns the contents of a file within a zip file as a string.
     * @param zipFile The path to the zip file.
     * @param pathInZip The path of the desired file within the zip file.
     * @returns Promise that resolves with the contents of the file, or rejects
     * with the error.
     */
    async getFileAsString(zipFile: string, pathInZip: string): Promise<[GenericMimeType | MimeType, string]> {
        const data = await fs.promises.readFile(zipFile);
        const jsZip = await JSZip.loadAsync(data as Buffer);
        const file = jsZip.file(pathInZip);

        if (!file) throw new Error('file not in zip');
        if (file.dir) throw new Error('file is directory');

        const buffer = await file.async("arraybuffer");

        const mimeType = await FileType.fromBuffer(buffer);

        if (mimeType?.mime.indexOf("text/") !== -1) {
            return [mimeType?.mime ?? GenericMimeType.TEXT, await file.async("string")];
        } else {
            return [mimeType?.mime ?? GenericMimeType.BINARY, Buffer.from(buffer).toString("base64")];
        }
    }

    /**
     * Gets all the entries of a folder within a zip file.
     * @param zipFile The path to the zip file.
     * @param pathInZip The path of the folder within the zip file.
     * @returns Promise that resolves with the directory entries, or rejects
     * with the error.
     */
    getFileEntries(zipFile: string, pathInZip: string): Promise<ApiDirectoryEntry[]> {
        return new Promise((resolve, reject) => {
            fs.readFile(zipFile, 'binary', (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        }).then(data => {
            return JSZip.loadAsync(data as Buffer)
        }).then(zip => {
            const jsZip = zip as JSZip;

            const file = pathInZip === '/' ? jsZip : jsZip.folder(pathInZip);

            if (file == null || file.length === 0) {
                throw new Error('folder not in zip');
            }

            let entries: ApiDirectoryEntry[] = [];

            file.forEach((relativePath, entry) => {
                const childsParent = path.basename(path.dirname(relativePath));

                if (childsParent !== '.')
                    return;

                entries.push({
                    fileName: entry.name,
                    isDirectory: entry.dir,
                    lastModification: entry.date
                })
            });

            return entries;
        });
    }

    /**
     * Deletes a zip file.
     * @param pathToZip The path to the zip file.
     */
    async deleteZip(pathToZip: string): Promise<void> {
        await unlinkFile(pathToZip);
    }
}

export class ZipCompressor implements IZipCompressor {

    /**
     * Compresses a file to a zip file.
     * @param originalName The original name of the file.
     * @param buffer The contents of the file.
     * @returns Promise that resolves with the path to the created zip file.
     */
    public async compressToZip(originalName: string, buffer: any): Promise<string> {
        const mime = await FileType.fromBuffer(buffer);

        if (mime?.mime !== "application/zip") {
            const zip = new JSZip();
            zip.file(originalName, buffer, { binary: true });
            buffer = await zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"});
        }

        const submissionId = uuidv4();
        const pathToZip = path.join(config.baseSubmissionFolder, `${submissionId}.zip`);

        await fs.promises.writeFile(pathToZip, buffer);

        return pathToZip;
    }
}

export class ZipSender implements IZipSender {

    /**
     * Sends a zip file to a response.
     * @param pathToFile The path to the zip file.
     * @param submission The submission.
     * @param res The response.
     * @returns Promise that resolves with the response.
     */
    sendZip(pathToFile: string, submission: ISubmission, res: Response): Promise<Response> {
        return new Promise((res, rej) => {
            fs.readFile(pathToFile, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            });
        }).then(data => {
            const buf = data as Buffer;

            res.set('Content-Type', 'application/octet-stream');
            res.set('Content-Disposition', `attachment; filename=${submission.directory}.zip`);
            res.set('Content-Length', buf.length.toString());
            res.end(buf, 'binary');
            return res;
        });
    }
}