import {useEffect, useState} from 'react';
import {Button, CloseButton, Col, Container, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {PublicUser} from '@responses/user';
import {userHasRole, UserRole} from "@role/role";
import {UserService} from "@services/user/userService";
import BanModal from "@components/ban/BanModal";
import {BanIcon} from "@components/icon/Icons";
import ProfileLink from "@components/profile/ProfileLink";

interface UserDetailProps {
    userId: string;
    exit: () => void;
}

export default function AdminUserDetails(props: UserDetailProps) {
    const [ showBanModal, setShowBanModal ] = useState(false);
    const [ user, setUser ] = useState<PublicUser | null>(null);

    const userService = new UserService();

    function getUser() {
        userService.getPublicProfile(props.userId).then(res => {
            if (res.data && res.data.status === "success")
                setUser(res.data.details);
        }).catch(_ => {});
    }

    useEffect(() => {
        getUser();
    }, [props.userId]);

    if (!user)
        return null;

    /**
     * Updates the user's role.
     */
    function toggleRole(role: UserRole) {
        if (!user)
            return;


        const newRole = !userHasRole ? (role & user.role) : (role ^ user.role);

        userService.setRole(props.userId, newRole).then(res => {
            if (res.data && res.data.status === "success") {
                getUser();
            }
        });
    }

    return (
        <Container>
            <Row>
                <Col>
                    <div className="float-end">
                        <CloseButton onClick={props.exit} />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProfileLink userId={props.userId} username={user.username} />
                </Col>
            </Row>

            <Row className="mb-3" hidden={!!user.firstName}>
                <Col><strong>First Name:</strong></Col>
                <Col xs={7}>{user.firstName}</Col>
            </Row>

            <Row className="mb-3" hidden={!!user.lastName}>
                <Col><strong>Last Name:</strong></Col>
                <Col xs={7}>{user.lastName}</Col>
            </Row>

            <Row className="mb-3 mt-3">
                <Col>
                    <div>
                        <Form.Check
                            type="checkbox"
                            label="Admin"
                            checked={userHasRole(UserRole.ADMIN, user.role)}
                            onClick={e => toggleRole(UserRole.ADMIN)}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Editor"
                            checked={userHasRole(UserRole.EDITOR, user.role)}
                            onClick={e => toggleRole(UserRole.EDITOR)} />
                    </div>
                </Col>
            </Row>

            <Row>
                {user.isBanned ?
                    <Col><strong className="text-danger">User is currently banned</strong></Col>
                    :<Col>
                        <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>
                                Ban this user.
                            </Tooltip>}>
                            <div className="d-grid gap-2">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    disabled={userHasRole(UserRole.ADMIN, user.role)}
                                    onClick={() => setShowBanModal(true)}
                                >
                                    <BanIcon /> Ban
                                </Button>
                            </div>
                        </OverlayTrigger>
                    </Col>
                }
            </Row>


            <BanModal userId={user.id}
                      show={showBanModal}
                      onClose={() => setShowBanModal(false)}
                      username={user.username} />
        </Container>
    );
}