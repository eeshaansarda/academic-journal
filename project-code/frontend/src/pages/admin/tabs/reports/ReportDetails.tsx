import { useState } from 'react';
import {Container, Row, Col, Button, OverlayTrigger, Tooltip, CloseButton} from 'react-bootstrap';
import {Report} from "@responses/report";
import {ReportService} from "@services/report/reportService";
import BanModal from "@components/ban/BanModal";
import {BanIcon} from "@components/icon/Icons";
import ProfileLink from "@components/profile/ProfileLink";

interface ReportDetailsProps {
    report: Report;
    exit: () => void;
    reportResolved: () => void;
}

export default function ReportDetails(props: ReportDetailsProps) {
    const report = props.report;
    const [ showBanModal, setShowBanModal ] = useState(false);
    const reportService = new ReportService();

    /**
     * Dismisses a report.
     */
    function dismissReport(): void {
        reportService.dismissReport(report.id).then(response => {
            if (response.data.status && response.data.status === 'success') {
                props.reportResolved();
                props.exit();
            }
        }).catch(_ => {});
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h4 className="mb-4">Report Details</h4>
                </Col>
                <Col xs="auto">
                    <CloseButton onClick={props.exit} />
                </Col>

                <Row className="mb-3">
                    <Col><strong>Subject:</strong></Col>
                    <Col xs={7}><ProfileLink userId={report.subject.id} username={report.subject.username} /></Col>
                </Row>

                <Row className="mb-3">
                    <Col><strong>Reason:</strong></Col>
                    <Col xs={7}>{report.reason}</Col>
                </Row>

                <Row className="mb-3">
                    <Col><strong>Reporter:</strong></Col>
                    <Col xs={7}><ProfileLink userId={report.reporter.id} username={report.reporter.username} /></Col>
                </Row>

                <Row>
                    <strong className="mb-3">Actions</strong>

                    <Col>
                        <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>
                                Ban this user.
                            </Tooltip>}>
                        <Button 
                            variant="outline-danger"
                            className="w-100"
                            size="sm"
                            onClick={() => setShowBanModal(true)}
                        >
                            <BanIcon /> Ban User
                        </Button>
                        </OverlayTrigger>
                    </Col>

                    <Col>
                        <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>
                                Dismiss this report.
                            </Tooltip>}>
                        <Button 
                            variant="outline-primary"
                            className="w-100"
                            size="sm"
                            onClick={dismissReport}
                        >
                            Dismiss Report
                        </Button>
                        </OverlayTrigger>
                    </Col>
                </Row>
            </Row>

            <BanModal userId={report.subject.id} show={showBanModal} onClose={() => setShowBanModal(false)} username={report.subject.username} />
        </Container>
    );
}