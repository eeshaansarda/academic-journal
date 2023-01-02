import {Submission, SubmissionStatus} from "@responses/submission";
import {Badge, Card, Col, Row} from "react-bootstrap";
import moment from "moment";
import "@components/submission/card/submissionCard.css";
import {faBook} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {truncate} from "lodash";
import {Link} from "react-router-dom";
import * as paths from "@config/paths";
import {removeTags} from "@root/utilities/sanitize/sanitizeHtml";

const DESCRIPTION_LENGTH = 50;

/**
 * @property submission the submission that we are displaying a summary of
 */
interface SubmissionCardProps {
    submission: Submission;
}

/**d
 * Component for summarizing a submission within a card. Upon click takes the user to the
 * submission page.
 *
 * @param submission the submission that we are displaying are summary of
 */
export default function SubmissionCard({ submission }: SubmissionCardProps) {
    function getStatusClass() {
        return submission.status === SubmissionStatus.PUBLISHED ? 'success' : 'warning';
    }

    return (
        <Card className="m-2 submission-card">
            <Card.Body>
                <Card.Title>
                    <Row>
                        <Col>
                            <FontAwesomeIcon icon={faBook} />
                            <Link className="stretched-link" to={`${paths.submissionPath}/${submission.submissionId}`}>{submission.title}</Link>
                        </Col>
                        <Col>
                            <Badge bg={getStatusClass()}>
                                {submission.status}
                            </Badge>
                        </Col>
                    </Row>
                </Card.Title>
                <Card.Text>
                    <Row>
                        <Col>{truncate(removeTags(submission.description), { length: DESCRIPTION_LENGTH})}</Col>
                    </Row>
                </Card.Text>
                <Card.Text>
                    <Row>
                        <Col className="text-muted mt-2">{moment(submission.published).format("DD/MM/YYYY")}</Col>
                    </Row>
                </Card.Text>
            </Card.Body>
        </Card>
    );
}