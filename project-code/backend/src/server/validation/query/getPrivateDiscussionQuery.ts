import {IsDefined, Min} from "class-validator";

/**
 * Represents query parameters to get a list of private discussions.
 */
export class GetPrivateDiscussions {
    @IsDefined()
    @Min(0)
    pageNumber: number;
}