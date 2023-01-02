import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@auth/Authentication";
import { Link, useHistory, useLocation } from "react-router-dom";
import {confirmSsoPath, dashboardPath, initiateForgottenPasswordPath, registerPath, selectSsoPath} from "@config/paths";
import {Button, Container, Form, Row, Col, FloatingLabel, OverlayTrigger, Popover} from "react-bootstrap";
import { Formik } from 'formik';
import "@pages/login/login.css"
import LogoTitle from "@components/logo/LogoTitle";
import NodeRSA from "node-rsa";
import { RSA_PUBLIC_KEY } from "@config/constants";
import {getEmailValidation, getPasswordValidation} from "@root/validations/user/validateUserRegistration";

const SSO_QUERY_PARAM = 'sso';
const REDIRECT_QUERY_PARAM = 'redirectUrl';
const STATE_QUERY_PARAM = 'state';

interface LoginForm {
    email: string;
    password: string;
}

interface LoginFormErrors {
    email?: string;
    password?: string;
}

export default function Login() {
    const auth = useContext(AuthContext);
    const history = useHistory();
    const location = useLocation();
    const [loginError, setLoginError] = useState('');
    const [encryptionKey, setEncryptionKey] = useState<NodeRSA | undefined>();

    /**
     * Attempts to log in using the provided credentials.
     * @param values The form values.
     */
    async function login(values: LoginForm): Promise<void> {
        if (!encryptionKey) {
            setLoginError('Unable to login, encryption service not initialised');
            return;
        }
        const result = await auth.login(values.email, values.password, encryptionKey);

        if (result === true) {
            const queryParams = new URLSearchParams(location.search);

            if (queryParams.has(SSO_QUERY_PARAM) && queryParams.has(REDIRECT_QUERY_PARAM) && queryParams.has(STATE_QUERY_PARAM)) {
                history.replace({ pathname: confirmSsoPath, search: queryParams.toString() });
            } else {
                history.replace({ pathname: dashboardPath });
            }
        } else if (typeof result === 'string') {
            setLoginError(result);
        }
    }

    /**
     * Checks the email and password are valid.
     * @param values The form values.
     * @returns The errors object.
     */
    function validateLoginForm(values: LoginForm): LoginFormErrors {
        const errors = {} as LoginFormErrors;

        const emailError = getEmailValidation(values.email);
        const passwordError = getPasswordValidation(values.password);

        if (emailError)
            errors.email = emailError;

        if (passwordError)
            errors.password = passwordError;

        return errors;
    }
    const queryParams = new URLSearchParams(location.search);
    const isSso = queryParams.has(SSO_QUERY_PARAM);

    useEffect(() => {
        setEncryptionKey(new NodeRSA().importKey({ 
            n: Buffer.from(RSA_PUBLIC_KEY, 'hex'),
            e: 65537
        }));
    }, []);

    return (
        <Container>
            <LogoTitle title="Login To Team 15" />
            <Row>
                <Col className="d-flex justify-content-center">
                    <Container fluid className="login-container">
                        <Formik
                            initialValues={{
                                email: '',
                                password: ''
                            }}
                            validate={validateLoginForm}
                            onSubmit={login}>
                            {({
                                  handleSubmit,
                                  handleChange,
                                  handleBlur,
                                  values,
                                  touched,
                                  errors,
                              }) => (
                                <Form noValidate onSubmit={handleSubmit} className="mt-4 login-form">
                                    <Form.Group className="mb-3">
                                        <FloatingLabel label="Email">
                                            <OverlayTrigger
                                                placement='right'
                                                overlay={<Popover>
                                                    <Popover.Header>
                                                        Email
                                                    </Popover.Header>
                                                    <Popover.Body>
                                                        The email associated with your user account. Must be in format username@domain.com
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control
                                                type="text"
                                                name="email"
                                                id="email"
                                                placeholder="Email"
                                                value={values.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>
                                        <Form.Control.Feedback type="invalid" style={{ display: errors.email && touched.email ? 'block' : 'none' }}>
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <FloatingLabel label="Password">
                                            <OverlayTrigger
                                                placement='right'
                                                overlay={<Popover>
                                                    <Popover.Header>
                                                        Password
                                                    </Popover.Header>
                                                    <Popover.Body>
                                                        The password for your user account.
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control type="password"
                                                name="password"
                                                placeholder="password"
                                                value={values.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>

                                        <Form.Control.Feedback type="invalid" style={{ display: errors.password && touched.password ? 'block' : 'none' }}>
                                            {errors.password}
                                        </Form.Control.Feedback>

                                        <p
                                            className="text-danger mt-2"
                                            style={{ fontSize: 14, display: !!loginError ? 'block': 'none' }}
                                        >
                                            {loginError}
                                        </p>
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button variant="primary" type="submit">Login</Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                        {isSso
                            ? <Container/>
                            :   [<Row className="mt-2">
                                <hr />
                                <Col className="text-center">
                                    <a href='/'
                                       onClick={e => {
                                           e.preventDefault();
                                           const emailElement = document.getElementById('email');
                                           const email = (emailElement as any).value;
                                           history.push({ pathname: initiateForgottenPasswordPath, search: `?email=${email}`});
                                       }}
                                    >
                                        Forgotten your password?
                                    </a>
                                </Col>
                            </Row>,<Row className="mt-2">
                                <Col className="text-center">
                                    <span>Don't have an account?   </span>
                                    <Link to={registerPath}>Register here</Link>
                                </Col>
                                <Col className="text-center">
                                    <span>Login with <Link to={selectSsoPath}>another journal</Link></span>
                                </Col>
                            </Row>
                            ]
                        }
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}