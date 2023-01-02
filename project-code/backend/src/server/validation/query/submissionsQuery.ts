import {IsDefined, IsInt, IsString} from "class-validator";
import {IsSort} from "@validation/custom/sortConstraint";

/**
 * Represents query parameters to get a list of submissions.
 */
export class SubmissionsQuery {
    @IsInt()
    @IsDefined()
    pageNumber: number;

    @IsString()
    title?: string;

    @IsInt()
    @IsSort({ message: "'sort' must be 1 or -1" })
    @IsDefined()
    sort: number;

    userId?: string;

    published?: boolean;
}



