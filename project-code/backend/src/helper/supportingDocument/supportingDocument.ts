import {ISupportingDocument} from "@models/submission/supportingDocument/supportingDocumentModel";
import * as util from "util";
import fs from "fs";
import {Response} from "express";

export interface ISupportingDocumentManipulator {
    sendSupportingDocument(supportingDocument: ISupportingDocument, res: Response): Promise<Response>;
    deleteSupportingDocument(supportingDocument: ISupportingDocument): Promise<void>;
}

const readFile = util.promisify(fs.readFile);
const unlinkFile = util.promisify(fs.unlink);

export class SupportingDocument implements ISupportingDocumentManipulator {
    public static readonly SUPPORTING_DOCUMENTS_DIRECTORY = 'supportingDocuments';

    /**
     * Sends the file for a given supporting document to a response.
     * @param supportingDocument The supporting document.
     * @param res The response.
     * @returns Promise that resolves with the response.
     */
    async sendSupportingDocument(supportingDocument: ISupportingDocument, res: Response): Promise<Response> {
        const file = await readFile(`${SupportingDocument.SUPPORTING_DOCUMENTS_DIRECTORY}/${supportingDocument.id}`);
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename=${supportingDocument.fileName}`);
        res.set('Content-Length', file.length.toString());
        res.end(file, 'binary');
        return res;
    }

    /**
     * Deletes the file for a given supporting document.
     * @param supportingDocument The supporting document.
     */
    async deleteSupportingDocument(supportingDocument: ISupportingDocument): Promise<void> {
        return unlinkFile(`${SupportingDocument.SUPPORTING_DOCUMENTS_DIRECTORY}/${supportingDocument.id}`);
    }
}