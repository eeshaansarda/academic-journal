import {IsDefined, IsInt, Min} from "class-validator";

/**
 * Represents query parameters to get a list of reports.
 */
export class ViewReportsQuery {
    @IsDefined()
    @IsInt()
    @Min(0)
    pageNumber: number;
}