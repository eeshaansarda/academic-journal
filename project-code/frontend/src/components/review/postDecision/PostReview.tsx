import {Button, Modal, Form} from "react-bootstrap";
import {EnvelopeIcon, ReviewIcon} from "@components/icon/Icons";
import {useState} from "react";
import {ReviewDecision} from "@responses/review";
import axios from "axios";
import {reviewDecisionEndpoint} from "@root/config";

/**
 * @property reviewId the id of the review that we are making a decision of
 * @property onReviewPosted event that is fired when we post a new review
 */
interface PostReviewProps {
    reviewId: string;
    onReviewPosted: () => void;
}

/**
 * Component that allows us to post a new review in the system
 * @param reviewId the id of the review that we are adding a new review of
 * @param onReviewPosted event that is fired when post a new review
 */
export default function PostReview({ reviewId, onReviewPosted }: PostReviewProps) {
    const [showModal, setShowModal] = useState(false);
    const [ comment, setComment] = useState('');
    const [error, setError] = useState("");
    const [verdict, setVerdict] = useState<ReviewDecision>(ReviewDecision.READY);

    /**
     * Uploads the review decision.
     */
    function postDecision() {
        if (!comment) {
            setError("You must provide a verdict explaining why you came to that decision");
            return;
        }

        axios.post(reviewDecisionEndpoint, {
            reviewId,
            decision: verdict,
            comment: comment
        }, {
            withCredentials: true
        }).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setComment("");
                handleClose();
                onReviewPosted();
            }
        }).catch(err => {
            if (err.response.data && err.response.data.status === "failure")
                setError(err.response.data.reason);
        });
    }

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (<>
        <Button variant="warning" onClick={handleOpen}><ReviewIcon /> Post Review</Button>

        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>Add Review Decision</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Select
                    name="decision"
                    onChange={e => {
                        const value = (e.target as any).value;
                        const verdict = value == 'Ready'
                            ? ReviewDecision.READY
                            : ReviewDecision.NOT_READY;
                        setVerdict(verdict);
                    }}>
                    <option>Ready</option>
                    <option>Not ready</option>
                </Form.Select>

                <Form.Control
                    type="text"
                    as="textarea"
                    rows={3}
                    className="mt-2"
                    name="comment"
                    value={comment}
                    onChange={e => {
                        const value = (e as any).target.value;
                        setComment(value);
                    }}
                />

                <p
                    className="mt-1 text-danger">
                    {error}
                </p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="warning" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={postDecision}>
                    <EnvelopeIcon /> Post
                </Button>
            </Modal.Footer>
        </Modal>
    </>);
}