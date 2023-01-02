import {ReviewDecision} from "@responses/review";
import {Badge} from "react-bootstrap";

interface ReviewBadgeProps {
    decision: ReviewDecision;
}

/**
 * Displays the status of the given review
 *
 * @param decision the decision that the user made
 */
export default function ReviewBadge({ decision }: ReviewBadgeProps) {
    switch (decision) {
        case ReviewDecision.UNDETERMINED:
            return <Badge bg="dark">Undetermined</Badge>;
        case ReviewDecision.READY:
            return <Badge bg="primary">Ready</Badge>
        case ReviewDecision.NOT_READY:
            return <Badge bg="dark">Not Ready</Badge>
    }
}