import {Button} from "react-bootstrap";
import React from "react";
import {ReviewService} from "@services/reviewService/reviewService";
import {ReviewIcon} from "@components/icon/Icons";

interface AddReviewProps {
    submissionId: string;
    onReviewAdded: (reviewId: string) => void;
}

/**
 * Button for adding a review to a submission
 * @param submissionId the id of the submission we are adding a review of
 * @param onReviewAdded the event that is fired when we add a review
 */
export default function AddReview({ submissionId, onReviewAdded } : AddReviewProps) {
    const reviewService = new ReviewService();

    function addReview() {
        reviewService.addReview(submissionId).then(response => {
            if (response.data && response.data.status === "success")
                onReviewAdded(response.data.reviewId);
        });
    }

    return (
        <Button variant="primary" onClick={addReview}>
            <ReviewIcon /> New Review
        </Button>
    );
}