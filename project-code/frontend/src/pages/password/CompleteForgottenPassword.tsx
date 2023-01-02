import LogoTitle from '@components/logo/LogoTitle';
import { RSA_PUBLIC_KEY } from '@config/constants';
import { loginPath } from '@config/paths';
import { UserService } from '@services/user/userService';
import { Formik } from 'formik';
import NodeRSA from 'node-rsa';
import { useEffect, useState } from 'react';
import { Button, Col, Container, FloatingLabel, Form, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';

interface ResetPasswordForm {
    password: string;
}

interface ResetPasswordFormErrors {
    password?: string;
}

export default function CompleteForgottenPassword() {
    const userService = new UserService();
    const history = useHistory();
    const location = useLocation();
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ encryptionKey, setEncryptionKey ] = useState<NodeRSA | undefined>();

    const queryParams = new URLSearchParams(location.search);
    if (!queryParams.has('id') || !queryParams.has('token')) {
        history.replace({ pathname: loginPath });
    }
    const userId = queryParams.get('id') as string;
    const token = queryParams.get('token') as string;

    /**
     * Checks that the provided password exists.
     * @param values The form values.
     * @returns The errors object.
     */
    const validatePasswordForm = (values: ResetPasswordForm): ResetPasswordFormErrors => {
        const errors: ResetPasswordFormErrors = {};

        const password = values.password;
        if (!password) {
            errors.password = 'Password is required';
        } else if (!isValidPassword(password)) {
            errors.password = 'Password must be at least 8 characters long, and contain at least one of each of the following: lowercase letter, uppercase letter, number';
        }

        return errors;
    }

    /**
     * Checks if a password is valid.
     * @param password The password.
     * @returns Whether the password is valid.
     */
    const isValidPassword = (password: string): boolean => {
        return password.length >= 8 && password !== password.toLowerCase()
            && password !== password.toUpperCase() && !!password.match(/\d/);
    }

    /**
     * Attempts to change the user's password.
     * @param values The form values.
     */
    const resetPassword = async (values: ResetPasswordForm): Promise<void> => {
        if (!encryptionKey) {
            setErrorMessage('Unable to login, encryption service not initialised');
            return;
        }

        userService.completeForgottenPassword(userId, values.password, token, encryptionKey)
            .then(res => {
                if (res.data.status && res.data.status == 'success') {
                    history.push({ pathname: loginPath });
                } else {
                    setErrorMessage('Failed to change password');
                }
            })
            .catch(_ => {
                setErrorMessage('Failed to change password');
            });
    }

    useEffect(() => {
        setEncryptionKey(new NodeRSA().importKey({ 
            n: Buffer.from(RSA_PUBLIC_KEY, 'hex'),
            e: 65537
        }));
    }, []);

    return (
        <Container>
            <LogoTitle title="Change Password" />

            <Row>
                <Col className="d-flex justify-content-center">
                    <Container fluid className="login-container">
                        <Formik
                            initialValues={{
                                email: '',
                                password: ''
                            }}
                            validate={validatePasswordForm}
                            onSubmit={resetPassword}>
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
                                        <FloatingLabel label="Password">
                                            <OverlayTrigger
                                                placement='right'
                                                overlay={<Popover>
                                                    <Popover.Header>
                                                        New Password
                                                    </Popover.Header>
                                                    <Popover.Body>
                                                        The new password for your user account. It must be at least 8 characters long, and contain <strong>at least one</strong> of each of the following: lowercase letter, uppercase letter, number
                                                    </Popover.Body>
                                                </Popover>}>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                placeholder="Password"
                                                value={values.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}/>
                                            </OverlayTrigger>
                                        </FloatingLabel>
                                        <Form.Control.Feedback type="invalid" style={{ display: errors.password && touched.password ? 'block' : 'none' }}>
                                            {errors.password}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    { !!errorMessage 
                                        ? <p 
                                            style={{ color: '#cb444b' }}
                                        >
                                            {errorMessage}
                                        </p>
                                        : <div/>
                                    }

                                    <div className="d-grid gap-2">
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                        >
                                            Change password
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}