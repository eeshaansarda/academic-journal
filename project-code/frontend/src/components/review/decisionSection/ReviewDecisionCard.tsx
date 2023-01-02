import {Review, ReviewDecision} from "@responses/review";
import ProfileLink from "@components/profile/ProfileLink";
import {Card, Col, Row} from "react-bootstrap";
import ReviewBadge from "@components/review/badge/ReviewBadge";

interface ReviewDecisionProps {
    review: Review;
}

/**
 * Displays the decision of a given review in the system
 * @param reviewId in which the decision was made
 */
export default function ReviewDecisionCard({ review }: ReviewDecisionProps) {
    if (review.status.decision === ReviewDecision.UNDETERMINED)
        return null;

    return (
        <>
            <h4>Review Summary</h4>
            <Card>
                <Card.Body>
                    <Row>
                        <Col md="auto">
                            <ProfileLink username={review.owner.username} userId={review.owner.id} />
                        </Col>
                        <Col md="auto">
                            <ReviewBadge decision={review.status.decision} />
                        </Col>
                        <Col>
                            {review.status.verdict}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>);
}