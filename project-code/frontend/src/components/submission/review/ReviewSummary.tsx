import {Review, ReviewDecision} from "@responses/review";
import {Badge, Card, Col, Row} from "react-bootstrap";
import {faAngleDoubleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {submissionPath} from "@config/paths";
import {Link} from "react-router-dom";
import ProfileLink from "@components/profile/ProfileLink";

/**
 * @property review the review being summarized
 * @property submissionId the id of the submission in review
 */
interface ReviewSummaryProps {
    review: Review;
    submissionId: string;
}

const reviewDecisionToColour = new Map<ReviewDecision, string>([
    [ReviewDecision.READY, 'success'],
    [ReviewDecision.NOT_READY, 'danger'],
    [ReviewDecision.UNDETERMINED, 'warning']
]);

const reviewDecisionFriendlyFormat = new Map<ReviewDecision, string>([
    [ReviewDecision.UNDETERMINED, 'Undetermined'],
    [ReviewDecision.READY, 'Ready'],
    [ReviewDecision.NOT_READY, 'Not Ready']
])

/**
 * Component for summarizing a reviw
 *
 * @param submissionId
 * @param review
 */
export default function ReviewSummary({ submissionId, review }: ReviewSummaryProps) {
    const backgroundColour = reviewDecisionToColour.get(review.status.decision);
    const decisionName = reviewDecisionFriendlyFormat.get(review.status.decision);
    const createdAt = new Date(review.createdAt).toLocaleDateString();


    return (
        <Card className="m-2">
            <Card.Body>
                <Card.Text>
                    <Row>
                        <Col>
                            <Row>
                                <Col>
                                    <ProfileLink userId={review.owner.id} username={review.owner.username} />
                                </Col>
                                <Col><Badge bg={backgroundColour}>{decisionName}</Badge></Col>
                                <Col>
                                    <Link to={`${submissionPath}/${submissionId}/review/${review.reviewId}`} className="float-end">
                                        <FontAwesomeIcon icon={faAngleDoubleRight}  />
                                    </Link>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="text-muted">{createdAt}</Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Text>
            </Card.Body>
        </Card>
    );
}