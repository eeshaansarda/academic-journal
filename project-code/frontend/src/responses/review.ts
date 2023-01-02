export enum ReviewDecision {
    READY = 'ready',
    NOT_READY = 'not_ready',
    UNDETERMINED = 'undetermined'
}

export interface Review {
    owner: {
        username: string;
        id: string;
    },
    createdAt: string;
    reviewId: string;
    status: {
        decision: ReviewDecision,
        verdict: string;
    },
    submissionId: string
}