import LogoTitle from '@components/logo/LogoTitle';
import { UserService } from '@services/user/userService';
import { Formik } from 'formik';
import { useState } from 'react';
import { Button, Col, Container, FloatingLabel, Form, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface EmailForm {
    email: string;
}

interface EmailFormErrors {
    email?: string;
}

export default function InitiateForgottenPassword() {
    const userService = new UserService();
    const location = useLocation();
    const [ message, setMessage ] = useState('');
    const [ isErrorMessage, setErrorMessage ] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const existingEmail = queryParams.has('email')
        ? queryParams.get('email') as string
        : '';

    /**
     * Checks that the provided email is valid.
     * @param values The form values.
     * @returns The errors object.
     */
    const validateEmailForm = (values: EmailForm): EmailFormErrors => {
        const errors: EmailFormErrors = {};

        const email = values.email;
        if (!email) {
            errors.email = 'Email is required';
        } else if (!email.match(EMAIL_REGEX)) {
            errors.email = 'Invalid email';
        }

        return errors;
    }

    /**
     * Attempts to send a password reset link to the user's email.
     * @param values The form values.
     */
    const sendPasswordReset = async (values: EmailForm): Promise<void> => {
        const email = values.email;
        userService.initiateForgottenPassword(email)
            .then(res => {
                if (res.data.status && res.data.status == 'success') {
                    setErrorMessage(false);
                    setMessage(`An email containing instructions to reset your password has been sent to ${email}`);
                } else {
                    setErrorMessage(true);
                    setMessage('Failed to send password reset email');
                }
            })
            .catch(_ => {
                setErrorMessage(true);
                setMessage('Failed to send password reset email');
            });
    }


    return (
        <Container>
            <LogoTitle title="Forgotten Password" />

            <Row>
                <Col className="d-flex justify-content-center">
                    <Container fluid className="login-container">
                        <Formik
                            initialValues={{
                                email: existingEmail,
                                password: ''
                            }}
                            validate={validateEmailForm}
                            onSubmit={sendPasswordReset}>
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

                                    { !!message 
                                        ? <p 
                                            style={{ color: isErrorMessage ? '#cb444b' : '#53a451' }}
                                        >
                                            {message}
                                        </p>
                                        : <div/>
                                    }

                                    <div className="d-grid gap-2">
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                        >
                                            Send password reset link
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