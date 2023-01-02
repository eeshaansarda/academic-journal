import {IsDefined} from "class-validator";

/**
 * Represents query parameters to get a submission.
 */
export class SubmissionQuery {
    @IsDefined()
    submissionId: string;

    version?: string;
}