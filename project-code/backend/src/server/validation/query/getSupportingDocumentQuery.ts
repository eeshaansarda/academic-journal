import {IsDefined} from "class-validator";

/**
 * Represents query parameters to get a supporting document.
 */
export class GetSupportingDocumentQuery {
    @IsDefined()
    submissionId: string;

    @IsDefined()
    supportingDocumentId: string;
}

/**
 * Represents query parameters to delete a supporting document.
 */
export class DeleteSupportingDocumentQuery {
    @IsDefined()
    submissionId: string;

    @IsDefined()
    supportingDocumentId: string;
}