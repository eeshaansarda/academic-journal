/**
 * Represents the identity of an author
 */
export interface Author {
    id: string;
    username: string;
}

/**
 * Represents the identity of a reviewer
 */
export interface Reviewer {
    id: string;
    username: string;
}

/**
 * Represents the identify of a coauthor
 */
export interface CoAuthor {
    id: string;
    username: string;
}

/**
 * Represents the status of a submission
 */
export enum SubmissionStatus {
    PUBLISHED = "Published",
    IN_REVIEW = "In Review"
}

/**
 * Represents a submission object returned by axios
 */
export interface Submission {
    submissionId: string;
    fileName: string;
    author: Author;
    description: string;
    title: string;
    reviewers: Reviewer[];
    published: number;
    status: SubmissionStatus;
    coAuthors: CoAuthor[];
}

/**
 * Response from getting a submission in axios
 */
export interface SubmissionResponse {
    status: string;
    submission: Submission;
}

/**
 * File in an axios response
 */
export interface File {
    content: string;
    fileName: string;
    contentType: string;
}

/**
 * Axios resposne from getting a file
 */
export interface GetFileResponse {
    status: string;
    file: File;
}

/**
 * Axios response for a supporting document
 */
export interface SupportingDocument {
    id: string;
    fileName: string;
}