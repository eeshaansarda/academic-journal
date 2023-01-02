import {IsDefined, ValidateNested} from "class-validator";
import {IComment} from "@models/comment/commentModel";
import {IUser} from "@models/user/userModel";

/**
 * Represents a location within a source code file (in the supergroup
 * format).
 */
export class ApiSGAnchor {
    @IsDefined()
    start: number;

    @IsDefined()
    end: number;
}

/**
 * Represents a comment (in the supergroup format).
 */
export class ApiSGComment {
    @IsDefined()
    id: number;

    replying?: number;

    filename?: string;

    @ValidateNested()
    anchor?: ApiSGAnchor;

    @IsDefined()
    contents: string;

    @IsDefined()
    author: string;

    @IsDefined()
    postedAt: number;

    /**
     * Creates a supergroup comment (to be returned from the API) from a
     * stored comment.
     * @param comment The stored comment.
     * @param author The author of the comment.
     * @returns The supergroup comment.
     */
    public static createApiSgCommentFromDocument(comment: IComment, author: IUser): ApiSGComment {
        return {
            id: comment.commentId,
            replying: comment.parentId ?? undefined,
            filename: comment.pathToFile,
            anchor: comment.anchor?.start ? comment.anchor : undefined,
            contents: comment.payload,
            author: author.id,
            postedAt: (comment.postedAt as any).getTime()
        };
    }
}

/**
 * Represents a review (in the supergroup format).
 */
export class ApiSGReview {
    @IsDefined()
    owner: string;

    @IsDefined()
    createdAt: number;

    @ValidateNested()
    @IsDefined()
    comments: ApiSGComment[];
}

/**
 * Represents a publication (in the supergroup format).
 */
export class ApiSGPublication {
    @IsDefined()
    name: string;

    @IsDefined()
    title: string;

    @IsDefined()
    owner: string;

    @IsDefined()
    introduction: string;

    @IsDefined()
    revision: string;

    @IsDefined()
    collaborators: string[];
}