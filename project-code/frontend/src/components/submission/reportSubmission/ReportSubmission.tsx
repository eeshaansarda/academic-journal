import {Button, Col, Form, Modal, OverlayTrigger, Popover, Row, Tooltip} from "react-bootstrap";
import {useState} from "react";
import {ReportService} from "@services/report/reportService";
import {Author} from "@responses/submission";

/**
 * @property author the author we are reporting
 */
interface ReportSubmissionProps {
    author: Author;
}

/**
 * Component for reporting an author of a submission
 * @param props
 */
export default function ReportSubmission(props: ReportSubmissionProps) {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const reportService = new ReportService();

    /**
     * Files a report against the author of the submission.
     */
    function reportUser(): void {
        reportService.reportUser(props.author.id, reportReason).then(res => {
            if (res.data.status && res.data.status === 'success') {
                setShowReportModal(false);
            }
        })
    }

    return (
        <>
            <Row>
                <Col>
                    <OverlayTrigger
                        placement='top'
                        overlay={<Tooltip>
                            Report the author of this submission.
                        </Tooltip>}>
                    <Button
                        variant="outline-danger"
                        onClick={() => setShowReportModal(true)}
                    >Report</Button>
                    </OverlayTrigger>
                </Col>

            </Row>
            <Modal
                show={showReportModal}
                onHide={() => setShowReportModal(false)}>
                <Modal.Header>
                    <Modal.Title>Report User</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Label>Please enter the reason for reporting {props.author.username}</Form.Label>

                    <OverlayTrigger
                        placement='top'
                        overlay={<Popover>
                            <Popover.Header>
                                Report Reason
                            </Popover.Header>
                            <Popover.Body>
                                The reason you are reporting {props.author.username}. Please include all details and be as descriptive as possible.
                            </Popover.Body>
                        </Popover>}>
                    <Form.Control
                        as="textarea"
                        placeholder="Reason"
                        rows={3}
                        style={{ resize: 'none' }}
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        className="mt-2"/>
                    </OverlayTrigger>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowReportModal(false)}
                    >Cancel</Button>
                    <OverlayTrigger
                        placement='top'
                        overlay={<Tooltip>
                            Report the author of this submission.
                        </Tooltip>}>
                    <Button
                        variant="danger"
                        onClick={reportUser}
                    >Report</Button>
                    </OverlayTrigger>
                </Modal.Footer>
            </Modal>
        </>
    );
}