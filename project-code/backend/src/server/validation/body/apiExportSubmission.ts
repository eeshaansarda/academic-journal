import {IsDefined} from "class-validator";

/**
 * Represents an exported submission.
 */
export class ApiExportSubmission {
    @IsDefined()
    id: string;

    @IsDefined()
    url: string;
}