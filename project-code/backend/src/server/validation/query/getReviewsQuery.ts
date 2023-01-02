import {ReviewDecision} from "@models/review/reviewModel";
import {IsDefined} from "class-validator";
import {IsSort} from "@validation/custom/sortConstraint";

/**
 * Represents query parameters to get a list of reviews.
 */
export class GetReviewsQuery {
    @IsDefined()
    pageNumber: number;

    decision?: ReviewDecision;

    @IsDefined()
    @IsSort()
    sort: number;

    reviewer?: string;
}