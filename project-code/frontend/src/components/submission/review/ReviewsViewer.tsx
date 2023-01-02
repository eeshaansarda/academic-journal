import {useEffect, useState} from "react";
import {Modal, Button} from "react-bootstrap";
import {ReviewService} from "@services/reviewService/reviewService";
import {Review} from "@responses/review";
import ReviewSummary from "@components/submission/review/ReviewSummary";
import NoReviews from "@components/submission/review/noReview/NoReviews";

/**
 * @property submissionId the id of the submission we are viewing the reviews of
 * @property show whether or not to show reviews
 * @property onClose event that is fired when we close the dialogue
 */
interface ReviewsViewerProps {
    submissionId: string;
    show: boolean;
    onClose: () => void;
}

/**
 *
 * @param submissionId
 * @param show
 * @param onClose
 * @constructor
 */
export default function ReviewsViewer({ submissionId, show, onClose } : ReviewsViewerProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const reviewService = new ReviewService();

    useEffect(() => {
        reviewService.getReviews(submissionId).then(response => {
            if (response.data && response.data.status === "success")
                setReviews(response.data.reviews);
        });
    }, [submissionId]);

    const transFormReviews = reviews.map(review => <ReviewSummary submissionId={submissionId} key={review.reviewId} review={review} />);

    return (
        <Modal show={show} onHide={onClose} scrollable>
            <Modal.Header closeButton>
                Reviews
            </Modal.Header>

            <Modal.Body>
                {reviews.length > 0 ? transFormReviews : <NoReviews />}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="warning" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}