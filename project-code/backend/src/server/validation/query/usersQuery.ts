import {IsDefined, IsInt, Min} from "class-validator";
import {IsSort} from "@validation/custom/sortConstraint";

/**
 * Represents query parameters to get a list of users.
 */
export class UsersQuery {
    @IsDefined()
    @IsInt()
    @Min(0)
    pageNumber: number;

    username?: string;

    @IsInt()
    @IsSort({ message: "'sort' must be 1 or -1" })
    sort: number;
}