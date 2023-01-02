import { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { AuthContext } from "@auth/Authentication";
import {dashboardPath, loginPath, selectSsoPath} from "@config/paths";
import {Button, Col, Container, FloatingLabel, Form, OverlayTrigger, Popover, Row} from "react-bootstrap";
import {Formik} from 'formik';
import {ErrorFeedback} from "@components/forms/ErrorFeedback";
import "@pages/login/login.css";
import LogoTitle from "@components/logo/LogoTitle";
import NodeRSA from "node-rsa";
import { RSA_PUBLIC_KEY } from "@config/constants";
import {
    getEmailValidation,
    getFirstNameValidation, getLastNameValidation, getPasswordValidation,
    getUsernameValidation
} from "@root/validations/user/validateUserRegistration";

interface RegisterForm {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface RegisterFormErrors {
    email?: string;
    password?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}

export default function Register() {
    const auth = useContext(AuthContext);
    const history = useHistory();
    const [ registerError, setRegisterError ] = useState('');
    const [ encryptionKey, setEncryptionKey ] = useState<NodeRSA | undefined>();

    /**
     * Attempts to register for an account.
     * @values values the values from register.
     */
    async function register(values: RegisterForm): Promise<void> {
        if (!encryptionKey) {
            setRegisterError('Unable to login, encryption service not initialised');
            return;
        }
        const user = {
            email: values.email,
            password: values.password,
            username: values.username,
            firstName: values.firstName,
            lastName: values.lastName
        } as any;

        const result = await auth.register(user, encryptionKey);

        if (result === true) {
            const state = {from: {pathname: dashboardPath}};
            history.replace(state.from);
        } else if (typeof result == 'string') {
            setRegisterError(result);
        }
    }

    /**
     * Checks that the user details are valid.
     * @param values The form values.
     * @returns The errors object.
     */
    function validateForm(values: RegisterForm): RegisterFormErrors {
        const errors = {} as RegisterFormErrors;

        let emailError = getEmailValidation(values.email);
        let passwordError = getPasswordValidation(values.password);
        let usernameError = getUsernameValidation(values.username);
        let firstNameError = getFirstNameValidation(values.firstName);
        let lastNameError = getLastNameValidation(values.lastName);

        if (emailError)
            errors.email = emailError;

        if (passwordError)
            errors.password = passwordError;

        if (usernameError)
            errors.username = usernameError;

        if (firstNameError)
            errors.firstName = firstNameError;

        if (lastNameError)
            errors.lastName = lastNameError;

        return errors;
    }

    useEffect(() => {
        setEncryptionKey(new NodeRSA().importKey({ 
            n: Buffer.from(RSA_PUBLIC_KEY, 'hex'),
            e: 65537
        }));
    }, []);

    return (
        <Container>
            <LogoTitle title="Register With Team 15" />
            <Row>
                <Col className="d-flex justify-content-center">
                    <Container fluid className="login-container">
                        <Formik
                            initialValues={{
                                email: '',
                                password: '',
                                username: '',
                                firstName: '',
                                lastName: ''
                            }}
                            validate={validateForm}
                            onSubmit={register}>
                            {({
                                  handleSubmit,
                                  handleChange,
                                  handleBlur,
                                  values,
                                  touched,
                                  errors,
                              }) => (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" >
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
                                                placeholder="Email"
                                                name="email"
                                                value={values.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>

                                        <Form.Text muted>
                                            Provide a valid email associated with your account.
                                        </Form.Text>
                                        <ErrorFeedback name="email" />
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
                                                        The password for your user account. It must be at least 8 characters long, and contain <strong>at least one</strong> of each of the following: lowercase letter, uppercase letter, number
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                name="password"
                                                value={values.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>

                                        <Form.Text muted>
                                            The password for your user account. It must be at least 8 characters long, and contain <strong>at least one</strong> of each of the following: lowercase letter, uppercase letter, number
                                        </Form.Text>

                                        <ErrorFeedback name="password" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <FloatingLabel label="Username">
                                            <OverlayTrigger
                                                placement='right'
                                                overlay={<Popover>
                                                    <Popover.Header>
                                                        Username
                                                    </Popover.Header>
                                                    <Popover.Body>
                                                        The username for your user account. It must be at least 4 characters long.
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control
                                                type="username"
                                                placeholder="Username"
                                                name="username"
                                                value={values.username}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>

                                        <Form.Text muted>
                                            The username for your user account. It must be at least 4 characters long.
                                        </Form.Text>

                                        <ErrorFeedback name="username" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <FloatingLabel label="First Name">
                                            <OverlayTrigger
                                                placement='right'
                                                overlay={<Popover>
                                                    <Popover.Header>
                                                        First Name
                                                    </Popover.Header>
                                                    <Popover.Body>
                                                        Your first name. Please use your real name.
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control
                                                type="text"
                                                placeholder="First Name"
                                                name="firstName"
                                                value={values.firstName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>

                                        <Form.Text muted>
                                            Your first name. Please use your real name.
                                        </Form.Text>

                                        <ErrorFeedback name="firstName"/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <FloatingLabel label="Last Name">
                                            <OverlayTrigger
                                                placement='right'
                                                overlay={<Popover>
                                                    <Popover.Header>
                                                        Last Name
                                                    </Popover.Header>
                                                    <Popover.Body>
                                                        Your last name. Please use your real name.
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Last name"
                                                name="lastName"
                                                value={values.lastName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>

                                        </FloatingLabel>

                                        <Form.Text muted>
                                            Your last name. Please use your real name.
                                        </Form.Text>

                                        <ErrorFeedback name="lastName" />

                                        <p
                                            className="text-danger mt-2"
                                            style={{ fontSize: 14, display: !!registerError ? 'block': 'none' }}
                                        >
                                            {registerError}
                                        </p>
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button type="submit" variant="primary">
                                            Register
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                        <Row className="mt-2">
                            <Row className="mt-2">
                                <hr />
                                <Col className="text-center">
                                    <span>Already have an account?   </span>
                                    <Link to={loginPath}>Login here</Link>
                                </Col>
                                <Col className="text-center">
                                    <span>Login with <Link to={selectSsoPath}>another journal</Link></span>
                                    </Col>
                            </Row>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}