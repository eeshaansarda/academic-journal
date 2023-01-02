import {IsDefined, IsOptional, IsString, ValidateNested} from "class-validator";
import {ISubmission} from "@models/submission/submissionModel";
import {ApiAuthor} from "@validation/body/apiAuthor";
import {Expose} from "class-transformer";
import {IUser} from "@models/user/userModel";

/**
 * Represents a submission.
 */
export class ApiSubmission {
    @Expose()
    submissionId: string;

    @Expose()
    fileName: string;

    @IsDefined()
    @Expose()
    description: string;

    @IsDefined()
    initialVersion: string;

    @IsDefined()
    @Expose()
    title: string;

    @Expose()
    published: string;

    @Expose()
    status: string;

    @ValidateNested()
    @Expose()
    author: ApiAuthor;

    reviewers: ApiReviewer[];

    coAuthors: ApiAuthor[];

    /**
     * Creates a submission (to be returned from the API) from a stored
     * submission.
     * @param document The stored submission.
     * @returns The submission.
     */
    public static createApiSubmissionFromDocument(document: ISubmission): ApiSubmission {
        return {
            submissionId: document.directory,
            fileName: document.getLatestVersion().fileName,
            description: document.description,
            initialVersion: document.versions.length > 0 ? document.versions[0].version : '',
            title: document.title,
            published: (document as any).created_at.valueOf(),
            status: document.published ? 'Published' : 'In Review',
            author: {
                id: (document.author as any).id,
                username: (document.author as any).username
            },
            reviewers: document.reviewers.map(reviewer => ({ id: (reviewer as IUser).id, username: (reviewer as IUser).username })),
            coAuthors: (document.coAuthors as IUser[]).map(author => ({ id: author.id, username: author.username }))
        }
    }

    /**
     * Creates a publication (to be returned from the API) from a stored
     * submission.
     * @param document The stored submission.
     * @returns The publication.
     */
    public static createApiPublicationFromDocument(document: ISubmission) {
        return {
            submissionId: document.directory,
            fileName: document.getLatestVersion().fileName,
            description: document.description,
            title: document.title,
            published: (document as any).created_at.valueOf(),
            author: {
                id: (document.author as any).id,
                username: (document.author as any).username
            }
        };
    }
}

/**
 * Represents a submission pulled from GitHub.
 */
export class ApiSubmissionGitHub extends ApiSubmission {
    @IsDefined()
    owner: string;

    @IsDefined()
    repoName: string;
}

/**
 * Represents a reviewer.
 */
export class ApiReviewer {
    @IsDefined()
    id: string;

    @IsDefined()
    username: string;
}

/**
 * Represents a directory entry within a submission.
 */
export class ApiDirectoryEntry {
    @IsDefined()
    fileName: string;

    @IsDefined()
    isDirectory: boolean;

    @IsDefined()
    lastModification: Date;

    @IsOptional()
    numComments?: number;
}

/**
 * Represents the body of a request to assign reviewers to a submission.
 */
export class ApiAssignReviewers {
    @IsDefined()
    submissionId: string;

    @IsDefined()
    reviewers: string[];
}

/**
 * Represents the body of a request to add a new version to a submission.
 */
export class ApiIncrementVersion {
    @IsDefined()
    submissionId: string;

    @IsDefined()
    @IsString()
    version: string;
}