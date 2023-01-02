import './Profile.css';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {Container, Row, Col, Button, Form, OverlayTrigger, Tooltip, FormGroup} from "react-bootstrap";
import { AuthContext } from '@auth/Authentication';
import {UserService} from "@services/user/userService";
import {changePasswordPath} from "@config/paths";
import {User} from "@responses/user";
import ChangeProfilePicture from "@components/user/profile/ChangeProfilePicture";
import InstitutionField from "@components/user/profile/InstitutionField";
import RichTextEditor from "@components/richTextEditor/RichTextEditor";
import {ContentState, EditorState} from "draft-js";
import {EditIcon, InstitutionIcon} from "@components/icon/Icons";
import htmlToDraft from "html-to-draftjs";
import ProfilePrivate from "@components/profile/private/ProfilePrivate";
import {GROUP_NAME} from "@config/constants";

export default function Profile() {
    const auth = useContext(AuthContext);
    const [ user, setUser ] = useState<User | null>(null);
    const [ userDetails, setUserDetails ] = useState<{[key: string]: string}>({
        email: '',
        firstName: '',
        lastName: '',
        institution: '',
        biography: '',
        twitter: '',
        facebook: '',
        linkedIn: ''
    });
    const [ unsavedChanges, setUnsavedChanges ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState('');

    const [biographyEditorState, setBiographyEditorState] = useState(createEditorState);

    const history = useHistory();
    const userService = new UserService();

    function createEditorState() {
        const { contentBlocks, entityMap } = htmlToDraft(user?.profile.biography ?? "");
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        return EditorState.createWithContent(contentState);
    }

    function getUserDetails() {
        auth.getDetails().then(newUser => {
            if (newUser && JSON.stringify(user) !== JSON.stringify(newUser)) {
                setUser(newUser);
                setUserDetails({
                    email: newUser.email ?? '',
                    firstName: newUser.firstName ?? '',
                    lastName: newUser.lastName ?? '',
                    institution: newUser.profile.institution ?? '',
                    biography: newUser.profile.biography ?? '',
                    twitter: newUser.profile.socialMedia.twitter ?? '',
                    facebook: newUser.profile.socialMedia.facebook ?? '',
                    linkedIn: newUser.profile.socialMedia.linkedIn ?? ''
                });
                setUnsavedChanges(false);
            }
        });
    }

    function isUserDetailsEqual() {
        if (!user)
            return true;

        return user.email === userDetails.email && user.firstName === userDetails.firstName
            && user.lastName === userDetails.lastName && user.profile.institution === userDetails.institution
            && user.profile.biography === userDetails.biography && user.profile.socialMedia.twitter === userDetails.twitter
            && user.profile.socialMedia.facebook === userDetails.facebook && user.profile.socialMedia.linkedIn === userDetails.linkedIn;
    }

    const changeFieldVisibility = (field: string, visible: boolean) => {
        userService.changeProfileFieldVisibility(field, visible)
            .then(res => {
                if (res.data.status && res.data.status == 'success') {
                    getUserDetails();
                }
            })
            .catch(_ => {});
    };

    const changeFields = () => {
        if (!user) {
            return;
        }

        if (!isUserDetailsEqual()) {
            setErrorMessage('');

            userService.changeProfileFields(userDetails as {[key: string]: string})
                .then(res => {
                    if (res.data.status && res.data.status == 'success') {
                        getUserDetails();
                    }
                })
                .catch(err => {
                    if (err.response && err.response.data && err.response.data.reason) {
                        setErrorMessage(err.response.data.reason);
                    } else {
                        setErrorMessage('Failed to save changes');
                    }
                    
                });
        }
    };

    useEffect(() => {
        if (!user) {
            return;
        }

        setUnsavedChanges(!isUserDetailsEqual());
    }, [userDetails]);

    useEffect(() => {
        getUserDetails();
    }, []);

    useEffect(() => {
        setBiographyEditorState(createEditorState);
    }, [user]);

    return (
        <Container>
            {!user
                ? <h1>You are not logged in</h1>
                : <Container>
                    <Row>
                        <Col className="d-flex justify-content-center">
                            <h2 className="mb-3"><EditIcon /> Edit Profile</h2>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col className="d-flex justify-content-center">
                            <ChangeProfilePicture userId={user.id} disabled={user.homeJournal !== GROUP_NAME} />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="justify-content-center d-flex">
                            <div style={{width: '70%'}}>
                                <Row className="mb-3">
                                    <Col className="d-flex justify-content-center">
                                        <FormGroup>
                                            <Form.Label>Biography</Form.Label>
                                            <RichTextEditor
                                                name="biography"
                                                editorState={biographyEditorState}
                                                onEditorStateChanged={setBiographyEditorState}
                                                onChange={biography => setUserDetails({...userDetails, biography })}
                                            />

                                            <Form.Text muted>
                                                Add a biography, this should describe yourself and what you do so that others can
                                                identfiy you.
                                            </Form.Text>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <FormGroup as={Col}>
                                        <Form.Label>Username</Form.Label>
                                        <OverlayTrigger
                                            placement='right'
                                            overlay={<Tooltip>
                                                You cannot change your username.
                                            </Tooltip>}
                                        >
                                            <Form.Control
                                                type="input"
                                                value={user.username}
                                                disabled
                                            />
                                        </OverlayTrigger>
                                    </FormGroup>
                                </Row>
                                <Row>
                                    <FormGroup as={Col}>
                                        <Form.Label>Email</Form.Label>
                                        <Row>
                                            <Col xs={1}>
                                                <ProfilePrivate public={user.profile.fieldVisibility.email}
                                                                onSetFieldPrivate={() => changeFieldVisibility('email', false)}
                                                                onSetFieldPublic={() => changeFieldVisibility('email', true)} />
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="input"
                                                    value={userDetails.email}
                                                    onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </Row>
                                <Row>
                                    <FormGroup as={Col}>
                                        <Form.Label>First Name</Form.Label>
                                        <Row>
                                            <Col xs={1}>
                                                <ProfilePrivate public={user.profile.fieldVisibility.firstName}
                                                                onSetFieldPrivate={() => changeFieldVisibility('firstName', false)}
                                                                onSetFieldPublic={() => changeFieldVisibility('firstName', true)} />
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="input"
                                                    value={userDetails.firstName}
                                                    onChange={e => setUserDetails({ ...userDetails, firstName: e.target.value })}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </Row>
                                <Row>
                                    <FormGroup as={Col}>
                                        <Form.Label>Last Name</Form.Label>
                                        <Row>
                                            <Col xs={1}>
                                                <ProfilePrivate public={user.profile.fieldVisibility.lastName}
                                                                onSetFieldPrivate={() => changeFieldVisibility('lastName', false)}
                                                                onSetFieldPublic={() => changeFieldVisibility('lastName', true)} />
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                type="input"
                                                value={userDetails.lastName}
                                                onChange={e => setUserDetails({ ...userDetails, lastName: e.target.value })} />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </Row>
                                <Row>
                                    <FormGroup as={Col}>
                                        <Form.Label><InstitutionIcon /> Institution</Form.Label>
                                        <Row>
                                            <Col xs={1}>
                                                <ProfilePrivate public={user.profile.fieldVisibility.institution}
                                                                onSetFieldPrivate={() => changeFieldVisibility('institution', false)}
                                                                onSetFieldPublic={() => changeFieldVisibility('institution', true)} />
                                            </Col>
                                            <Col>
                                                <InstitutionField institution={userDetails.institution} onInstitutionChange={institution => setUserDetails({ ...userDetails, institution })} />
                                            </Col>
                                        </Row>
                                        <Form.Text muted>
                                            Add the institution you are linked to (for example University of St Andrews)
                                        </Form.Text>
                                    </FormGroup>
                                </Row>

                                <Row className="mt-4">
                                    <h3>Social Media</h3>

                                    <Row>
                                        <FormGroup>
                                            <Col>
                                                <Form.Label>Twitter URL</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="input"
                                                    placeholder='https://twitter.com/username'
                                                    value={userDetails.twitter}
                                                    onChange={e => setUserDetails({ ...userDetails, twitter: e.target.value })}
                                                />
                                            </Col>
                                        </FormGroup>
                                    </Row>

                                    <Row>
                                        <FormGroup>
                                            <Col>
                                                <Form.Label>Facebook URL</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="input"
                                                    placeholder='https://www.facebook.com/id'
                                                    value={userDetails.facebook}
                                                    onChange={e => setUserDetails({ ...userDetails, facebook: e.target.value })}
                                                />
                                            </Col>
                                        </FormGroup>
                                    </Row>

                                    <Row>
                                        <FormGroup>
                                            <Col>
                                                <Form.Label>LinkedIn URL</Form.Label>
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    type="input"
                                                    placeholder='https://linkedin.com/id'
                                                    value={userDetails.linkedIn}
                                                    onChange={e => setUserDetails({ ...userDetails, linkedIn: e.target.value })}
                                                />
                                            </Col>
                                        </FormGroup>
                                    </Row>
                                </Row>

                                <Row>
                                    <Col className="d-flex justify-content-center">
                                        <OverlayTrigger
                                            placement='right'
                                            overlay={<Tooltip
                                                hidden={unsavedChanges}>
                                                You have no unsaved changes.
                                            </Tooltip>}
                                        >
                                            <div>
                                                <Button
                                                    variant="outline-primary"
                                                    className="mt-3 mb-2 pr-2"
                                                    disabled={!unsavedChanges}
                                                    onClick={changeFields}
                                                >Save Changes</Button>
                                            </div>
                                        </OverlayTrigger>
                                    </Col>


                                    <Col className="justify-content-center d-flex">
                                        <Button
                                            variant="outline-primary"
                                            className="mt-3 mb-2 ml-1"
                                            disabled={user.homeJournal !== GROUP_NAME}
                                            onClick={() => history.push({ pathname: changePasswordPath })}
                                        >Change Password</Button>
                                    </Col>
                                </Row>

                                <Row>
                                <p className='text-danger'>
                                    {errorMessage}
                                </p>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            }
        </Container>
    );
}