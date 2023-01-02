import {IsDefined} from "class-validator";

/**
 * Represents a supporting document.
 */
export class ApiAddSupportingDocument {
    @IsDefined()
    submissionId: string;
}