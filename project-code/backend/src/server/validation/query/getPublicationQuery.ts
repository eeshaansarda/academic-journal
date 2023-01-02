import {IsDefined, IsInt, IsOptional, IsString, Min} from "class-validator";
import {IsSort} from "@validation/custom/sortConstraint";

/**
 * Represents query parameters to get a list of publications.
 */
export class GetPublicationsQuery {
    @IsString()
    @IsOptional()
    title?: string;

    @IsDefined()
    @Min(0)
    pageNumber: number

    @IsSort({ message: "sort must be 1 or -1" })
    @IsDefined()
    @IsInt()
    sort: number;

    @IsOptional()
    userId?: string;
}