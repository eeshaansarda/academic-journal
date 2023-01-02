import {
    Authorized, Body,
    CurrentUser, Delete,
    Get,
    JsonController,
    NotFoundError,
    Put, QueryParam, QueryParams, Res,
    UnauthorizedError,
    UploadedFile
} from "routing-controllers";
import multer from "multer";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {SessionUser} from "@validation/session/SessionUser";
import {ISubmissionRepository, SubmissionModel} from "@models/submission/submissionModel";
import {ApiAddSupportingDocument} from "@validation/body/apiSupportingDocument";
import {DeleteSupportingDocumentQuery, GetSupportingDocumentQuery} from "@validation/query/getSupportingDocumentQuery";
import {ISupportingDocumentManipulator, SupportingDocument} from "@helper/supportingDocument/supportingDocument";
import {Response} from "express";
import {Service} from "typedi";
import { config } from "@config/config";

/**
 * Disk storage object that assigns a unique ID as the filename.
 */
const supportingDocumentStorage = multer.diskStorage({
    destination: config.supportingDocumentFolder,
    filename: (req, file, cb) => {
        const filename = uuidv4();
        file.filename = filename;
        return cb(null, filename);
    }
});

@JsonController("/submission/supporting/document")
@Service()
export default class SupportingDocumentsController {
    public static readonly POST_SUPPORTING_DOCUMENT_ENDPOINT = "/";
    public static readonly GET_SUPPORTING_DOCUMENT_METADATA = "/metadata";
    public static readonly GET_SUPPORTING_DOCUMENT = "/";
    public static readonly DELETE_SUPPORTING_DOCUMENT = "/delete";

    public static readonly MAX_SUPPORTING_DOCUMENT_SIZE = 1024 * 1024;
    public submissionModel: ISubmissionRepository = SubmissionModel;
    public supportingDocumentManipulator: ISupportingDocumentManipulator = new SupportingDocument();

    /**
     * Endpoint to upload a supporting document to a submission.
     * @param currentUser The user who made the request.
     * @param supportingDocument The document file attached to the request.
     * @param supportingDocumentBody The request body.
     */
    @Put(SupportingDocumentsController.POST_SUPPORTING_DOCUMENT_ENDPOINT)
    @Authorized()
    public async addSupportingDocument(@CurrentUser({ required: true }) currentUser: SessionUser,
                                       @UploadedFile("supportingDocument", {
                                           options: {
                                               storage: supportingDocumentStorage,
                                               limits: { fileSize: SupportingDocumentsController.MAX_SUPPORTING_DOCUMENT_SIZE }
                                           }
                                       }) supportingDocument: any,
                                       @Body({required: true}) supportingDocumentBody: ApiAddSupportingDocument) {
        const submission = await this.submissionModel.getOneAndPopulate({ directory: supportingDocumentBody.submissionId });

        if (!submission)
            throw new NotFoundError("the given submission does not exist");

        if (!submission.assertAuthor(currentUser.id))
            throw new UnauthorizedError("you are not authorized to add a supporting document");

        await submission.addSupportingDocument(supportingDocument.originalname, path.parse(supportingDocument.filename).name);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to get the metadata of the supporting documents for a 
     * submission.
     * @param currentUser The user who made the request.
     * @param submissionId The ID of the submission.
     */
    @Get(SupportingDocumentsController.GET_SUPPORTING_DOCUMENT_METADATA)
    @Authorized()
    public async getMetadata(@CurrentUser({ required: true }) currentUser: SessionUser,
                             @QueryParam("submissionId", { required: true }) submissionId: string) {
        const submission = await this.submissionModel.getOne({ directory: submissionId });

        if (!submission)
            throw new NotFoundError("the given submission does not exist");

        return {
            status: "success",
            documents: submission.supportingDocuments.map(doc => ({fileName: doc.fileName, id: doc.id}))
        };
    }

    /**
     * Endpoint to get a supporting document.
     * @param currentUser The user who made the request.
     * @param supportingDocument The query parameters.
     * @param res The response.
     */
    @Get(SupportingDocumentsController.GET_SUPPORTING_DOCUMENT)
    @Authorized()
    public async getSupportingDocument(@CurrentUser({ required:  true }) currentUser: SessionUser,
                                       @QueryParams({ required: true }) supportingDocument: GetSupportingDocumentQuery,
                                       @Res() res: Response) {
        const submission = await this.submissionModel.getOne({ directory: supportingDocument.submissionId });

        if (!submission)
            throw new NotFoundError("the given submission does not exist");

        const document = submission.supportingDocuments.find(doc => doc.id === supportingDocument.supportingDocumentId);

        if (!document)
            throw new NotFoundError("the supporting document does not exist");

        return this.supportingDocumentManipulator.sendSupportingDocument(document, res);
    }

    /**
     * Endpoint to delete a supporting document.
     * @param currentUser The user who made the request.
     * @param deleteDocument The query parameters.
     */
    @Delete(SupportingDocumentsController.DELETE_SUPPORTING_DOCUMENT)
    @Authorized()
    public async deleteSupportingDocument(@CurrentUser({ required: true }) currentUser: SessionUser,
                                          @QueryParams({ required: true }) deleteDocument: DeleteSupportingDocumentQuery) {
        const submission = await this.submissionModel.getOne({ directory:  deleteDocument.submissionId });

        if (!submission)
            throw new NotFoundError("the given submission does not exist");

        if (!submission.assertAuthor(currentUser.id)) {
            throw new UnauthorizedError("you must be the author to delete the document");
        }

        const document = submission.supportingDocuments.find(doc => doc.id === deleteDocument.supportingDocumentId);

        if (!document)
            throw new NotFoundError("the given document does not exist");

        try {
            await this.supportingDocumentManipulator.deleteSupportingDocument(document);
        } catch (e) {
            throw new NotFoundError("supporting document does not exist");
        }

        await submission.deleteSupportingDocument(deleteDocument.supportingDocumentId);

        return {
            status: "success"
        };
    }
}