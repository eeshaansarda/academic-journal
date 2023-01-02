import {IsDefined} from "class-validator";

/**
 * Represents query parameters to get a list of general comments.
 */
export class GetGeneralCommentsQuery {
    @IsDefined()
    reviewId: string;
}

/**
 * Represents query parameters to get the comments (within a given review)
 * on a specific file.
 */
export class GetFileCommentsQuery {
    @IsDefined()
    reviewId: string;

    @IsDefined()
    pathToFile: string;
}