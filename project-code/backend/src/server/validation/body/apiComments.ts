import {IsDefined, IsInt, IsOptional, Min, ValidateNested} from "class-validator";
import {IComment} from "@models/comment/commentModel";
import {Expose} from "class-transformer";

/**
 * Represents a user who has posted a comment.
 */
export class ApiCommenter {
    @Expose()
    @IsDefined()
    username: string;

    @Expose()
    @IsDefined()
    userId: string;
}

/**
 * Represents a general comment.
 */
export class ApiGeneralComment {
    @IsDefined()
    reviewId: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    parentId?: number;

    @IsDefined()
    payload: string;

    commenter: ApiCommenter;

    commentId: number;
}

/**
 * Represents the position of a comment within a source code file.
 */
export class ApiAnchor {
    @IsDefined()
    @IsInt()
    @Min(0)
    start: number;

    @IsInt()
    @IsDefined()
    end: number;
}

/**
 * Represents a comment.
 */
export class ApiComment {
    @Expose()
    @IsDefined()
    reviewId: string;

    @Expose()
    parentId?: number;

    @Expose()
    @IsDefined()
    payload: string;

    @Expose()
    @IsDefined()
    pathToFile?: string;

    @Expose()
    @ValidateNested()
    anchor?: ApiAnchor;

    commentMade: number;

    @Expose()
    commenter: ApiCommenter;

    @Expose()
    commentId: number;

    /**
     * Creates a comment (to be returned from the API) from a stored comment.
     * @param document The stored comment.
     * @param reviewId The ID of the review.
     * @returns The comment.
     */
    public static createApiCommentFromDocument(document: IComment, reviewId: string): ApiComment {
        let apiComment = new ApiComment();
        apiComment.reviewId = reviewId;
        apiComment.parentId = document.parentId;
        apiComment.pathToFile = document.pathToFile;
        apiComment.anchor = document.anchor;
        apiComment.commentMade = document.postedAt.valueOf();
        apiComment.payload = document.payload;
        apiComment.commenter = {
            username: (document.commenter as any).username,
            userId: (document.commenter as any).id
        }
        apiComment.commentId = document.commentId;
        return apiComment;
    }
}