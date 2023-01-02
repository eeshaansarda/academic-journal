import {Button, Form, Modal, OverlayTrigger, Popover, Tooltip} from "react-bootstrap";
import {useState} from "react";
import {BanService} from "@services/ban/banService";

interface BanModalProps {
    userId: string;
    show: boolean;
    onClose: () => void;
    username: string;
}

/**
 * A modal dialogue component that is used to ban the user from
 * the system.
 */
export default function BanModal({ userId, username, show, onClose }: BanModalProps) {
    const [ banReason, setBanReason ] = useState('');
    const [ banDuration, setBanDuration ] = useState('1 week');
    const banService = new BanService();

    /**
     * Converts the ban duration to a number in milliseconds.
     * @returns The ban duration in seconds.
     */
    function getBanDuration(): number {
        switch (banDuration) {
            case '1 day':
                return 24 * 60 * 60 * 1000;

            case '1 week':
                return 7 * 24 * 60 * 60 * 1000;

            case '1 month':
                return 31 * 24 * 60 * 60 * 1000;

            case '1 year':
                return 365 * 24 * 60 * 60 * 1000;

            default:
                throw new Error(`Unknown ban duration ${banDuration}`);
        }
    }

    /**
     * Bans the user.
     */
    function banUser(): void {
        const reason = banReason || 'No reason provided';
        const expiry = Date.now() + getBanDuration();

        banService.banUser({ userId: userId, reason, expiry }).then(res => {
            if (res.data && res.data.status === "success") {
                onClose();
            }
        });
    }


    return (
        <Modal
            show={show}
            onHide={onClose}
        >
            <Modal.Header>
                <Modal.Title>Ban User</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Label>Please enter the reason and length of ban for {username}</Form.Label>

                <OverlayTrigger
                    placement='top'
                    overlay={<Popover>
                        <Popover.Header>
                            Ban Reason
                        </Popover.Header>
                        <Popover.Body>
                            The reason you are banning {username}. Please include all details and be as descriptive as possible.
                        </Popover.Body>
                    </Popover>}>
                    <Form.Control
                        as="textarea"
                        placeholder="Ban reason"
                        rows={3}
                        style={{ resize: 'none' }}
                        value={banReason}
                        onChange={e => setBanReason(e.target.value)}
                        className="mt-2"/>
                </OverlayTrigger>

                <OverlayTrigger
                    placement='top'
                    overlay={<Popover>
                        <Popover.Header>
                            Ban Duration
                        </Popover.Header>
                        <Popover.Body>
                            The duration the ban will last for.
                        </Popover.Body>
                    </Popover>}>
                    <Form.Select
                        className="mt-2"
                        value={banDuration}
                        onChange={e => setBanDuration((e as any).target.value)}>
                        <option>1 day</option>
                        <option>1 week</option>
                        <option>1 month</option>
                        <option>1 year</option>
                    </Form.Select>
                </OverlayTrigger>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onClose}
                >Cancel</Button>

                <OverlayTrigger
                    placement='top'
                    overlay={<Tooltip>
                        Ban this user.
                    </Tooltip>}>
                    <Button
                        variant="danger"
                        onClick={banUser}
                    >Ban</Button>
                </OverlayTrigger>
            </Modal.Footer>
        </Modal>
    );
}