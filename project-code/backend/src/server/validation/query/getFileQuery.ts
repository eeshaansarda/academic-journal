import {IsDefined, IsOptional} from "class-validator";

/**
 * Represents query parameters to get a file.
 */
export class GetFileQuery {
    @IsDefined()
    submissionId: string;

    @IsDefined()
    pathToFile: string;

    @IsOptional()
    reviewId?: string;
}