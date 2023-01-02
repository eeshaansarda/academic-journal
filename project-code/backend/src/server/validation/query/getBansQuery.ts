import {IsDefined, IsInt, Min} from "class-validator";

/**
 * Represents query parameters to get a list of bans.
 */
export class GetBansQuery {
    @IsInt()
    @IsDefined()
    @Min(0)
    pageNumber: number;
}