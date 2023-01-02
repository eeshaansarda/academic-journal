import {IsDefined, ValidateNested} from "class-validator";
import {IReview, ReviewDecision} from "@models/review/reviewModel";
import {IUser} from "@models/user/userModel";
import {ISubmission} from "@models/submission/submissionModel";

/**
 * Represents a user who is a reviewer.
 */
export class ApiReviewer {
    @IsDefined()
    username: string;

    @IsDefined()
    id: string;
}

/**
 * Represents the status of a review.
 */
export class ApiReviewStatus {
    @IsDefined()
    decision: ReviewDecision;

    verdict?: string;
}

/**
 * Represents a review.
 */
export class ApiReview {
    @IsDefined()
    reviewId: string;

    @ValidateNested()
    @IsDefined()
    owner: ApiReviewer;

    @IsDefined()
    createdAt: number;

    status: ApiReviewStatus;

    submissionId: string;

    /**
     * Creates a review (to be returned from the API) from a stored
     * review.
     * @param review The stored review.
     * @returns The review.
     */
    public static createApiReviewFromDocument(review: IReview): ApiReview {
        return {
            reviewId: review.reviewId,
            owner: {
                username: (review.owner as IUser).username,
                id: (review.owner as IUser).id
            },
            createdAt: (review as any).created_at,
            status: {
                decision: review.status.decision,
                verdict: review.status.verdict
            },
            submissionId: (review.submissionId as ISubmission).directory
        };
    }
}

/**
 * Represents the verdict on a review.
 */
export class ApiReviewVerdict {
    @IsDefined()
    reviewId: string;

    @IsDefined()
    decision: ReviewDecision;

    @IsDefined()
    comment: string;
}

/**
 * Represents the body of a request to create a new review on a submission.
 */
export class ApiPostReview {
    @IsDefined()
    submissionId: string;
}