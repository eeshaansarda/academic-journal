import {IsDefined} from "class-validator";

/**
 * Represents the body of a request to add a co-author to a submission.
 */
export class ApiAddCoAuthor {
    @IsDefined()
    submissionId: string;

    @IsDefined()
    userIds: string[];
}