import {IsDefined} from "class-validator";

/**
 * Represents query parameters to import a submission.
 */
export class PostImportSubmissionQuery {
    @IsDefined()
    from: string;

    @IsDefined()
    id: string;

    @IsDefined()
    token: string;
}