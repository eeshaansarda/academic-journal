import {Container, Row, Col} from "react-bootstrap";
import SsoSelector from "@components/sso/SsoSelector";
import "@pages/sso/selectSso.css";
import {loginPath} from "@config/paths";
import {Link} from "react-router-dom";
import LogoTitle from "@components/logo/LogoTitle";

export default function SelectSso() {
    return (
        <Container>
            <LogoTitle title="Select SSO Provider" />
            <Row>
                <Col className="justify-content-center d-flex">
                    <div style={{width: '100%', maxWidth: '30rem'}}>
                        <Row>
                            <Col className="d-flex justify-content-center">
                                <SsoSelector />
                            </Col>
                        </Row>

                        <Row>
                            <Col className="text-center">
                                <hr />
                                <span>Back to <Link to={loginPath}>login</Link></span>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}