import {Container, Row, Col, Button, OverlayTrigger, Tooltip, CloseButton} from 'react-bootstrap';
import {Ban} from "@responses/bans";
import {BanService} from "@services/ban/banService";
import ProfileLink from "@components/profile/ProfileLink";

interface BanDetailsProps {
    ban: Ban;
    exit: () => void;
    banRevoked: () => void;
}

export default function BanDetails(props: BanDetailsProps) {
    const ban = props.ban;
    const expiry = new Date(ban.expiry).toUTCString();
    const banService = new BanService();

    /**
     * Revokes a ban.
     */
    function revokeBan(): void {
        banService.revokeBan(ban.id).then(response => {
            if (response.data.status && response.data.status === 'success') {
                props.banRevoked();
                props.exit();
            }
        }).catch(_ => {});
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h4 className="mb-4">Ban Details</h4>
                </Col>
                <Col xs="auto">
                    <CloseButton onClick={props.exit} />
                </Col>
            </Row>

            <Row className="mb-3">
                <Col><strong>User:</strong></Col>
                <Col xs={7}><ProfileLink userId={ban.subject.id} username={ban.subject.username} /></Col>
            </Row>

            <Row className="mb-3">
                <Col><strong>Reason:</strong></Col>
                <Col xs={7}>{ban.reason}</Col>
            </Row>

            <Row className="mb-3">
                <Col><strong>Issued by:</strong></Col>
                <Col xs={7}><ProfileLink userId={ban.issuer.id} username={ban.issuer.username} /></Col>
            </Row>

            <Row className="mb-3">
                <Col><strong>Expiry:</strong></Col>
                <Col xs={7}>{expiry}</Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <OverlayTrigger
                        placement='top'
                        overlay={<Tooltip>
                            Revoke this ban and allow {ban.subject.username} to login again.
                        </Tooltip>}>
                        <div className="d-grid gap-2">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={revokeBan}
                            >
                                Revoke
                            </Button>
                        </div>
                    </OverlayTrigger>
                </Col>
            </Row>
        </Container>
    );
}