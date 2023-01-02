import React, {SyntheticEvent} from "react";
import {useLocation} from "react-router-dom";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {confirmSsoEndpoint} from "@root/config";
import LogoTitle from "@components/logo/LogoTitle";
import "@pages/login/login.css";

const REDIRECT_PARAM = "redirectUrl";
const STATE_PARAM = "state";

export default function ConfirmSso() {
    const search = useLocation().search;

    const queryParams = new URLSearchParams(search);

    if (!queryParams.has(REDIRECT_PARAM) || !queryParams.has(STATE_PARAM))
        return (<Container>
            <h2>An error occurred processing your SSO request</h2>
        </Container>);

    const redirectUrl = queryParams.get(REDIRECT_PARAM);
    const state = queryParams.get(STATE_PARAM);

    function confirm(e: SyntheticEvent) {
        e.preventDefault();

        if (!redirectUrl || !state)
            return;

        // on confirm sso redirect the user back to the original journal
        window.location.href = `${confirmSsoEndpoint}?${REDIRECT_PARAM}=${redirectUrl}&${STATE_PARAM}=${state}`;
    }

    return (
        <Container>
            <LogoTitle title="Confirm SSO" />
            <Form onSubmit={confirm}>
                <Container fluid className="login-container">
                    <Row>
                        <Col className="d-flex justify-content-center">
                            <Form.Label className="mb-3">Are you sure you want to sign in to {redirectUrl}</Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="d-grid gap-2">
                                <Button variant="primary" onClick={confirm} type="submit">Yes</Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Form>
        </Container>
    );
}