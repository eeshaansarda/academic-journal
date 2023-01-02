import { useEffect, useState } from 'react';
import { Container, Form, Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { Formik } from 'formik';
import { useHistory } from 'react-router';
import { loginPath } from '@config/paths';
import {UserService} from "@services/user/userService";
import NodeRSA from 'node-rsa';
import { RSA_PUBLIC_KEY } from '@config/constants';

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
}

interface ChangePasswordFormErrors {
    currentPassword?: string;
    newPassword?: string;
}

export default function ChangePassword() {
    const history = useHistory();
    const userService = new UserService();
    const [ showPasswordError, setShowPasswordError ] = useState(false);
    const [ error, setError ] = useState('');
    const [ encryptionKey, setEncryptionKey ] = useState<NodeRSA | undefined>();
    
    /**
     * Changes the user's password
     * @param values The form values.
     */
    const changePasswordFormSubmitted = async (values: ChangePasswordForm): Promise<void> => {
        if (!encryptionKey) {
            setError('Unable to login, encryption service not initialised');
            return;
        }
        const changed = await changePassword(values);
        
        if (changed) {
            history.push({ pathname: loginPath });
        } else {
            setShowPasswordError(true);
        }
    }

    /**
     * Attempts to change the user's password.
     * @param values The change password form values.
     * @returns Promise with boolean whether the password was changed.
     */
    const changePassword = (values: ChangePasswordForm): Promise<boolean> => {
        return new Promise(res => {
            userService.changePassword(values.currentPassword, values.newPassword, encryptionKey as NodeRSA).then(response => {
                if (response.data.status && response.data.status === 'success') {
                    res(true);
                } else {
                    res(false);
                }
            }).catch(_ => res(false));
        })
    };

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
     * Checks that the form details are valid.
     * @param values The form values.
     * @returns The errors object.
     */
    const validate = (values: ChangePasswordForm): ChangePasswordFormErrors => {
        const errors = {} as ChangePasswordFormErrors;

        if (!values.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        const newPassword = values.newPassword;
        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else if (!isValidPassword(newPassword)) {
            errors.newPassword = 'Password must be at least 8 characters long, and contain at least one of each of the following: lowercase letter, uppercase letter, number';
        }

        // hide password error when changes have been made to the form
        if (showPasswordError) {
            setShowPasswordError(false);
        }

        return errors;
    };

    useEffect(() => {
        // Encrypt the login prior to sending
        setEncryptionKey(new NodeRSA().importKey({ 
            n: Buffer.from(RSA_PUBLIC_KEY, 'hex'),
            e: 65537
        }));
    }, []);

    return (
        <Container>
            <h2 className="mb-3">Change Password</h2>

            <Formik
                initialValues={{
                    currentPassword: '',
                    newPassword: ''
                }}
                validate={validate}
                onSubmit={changePasswordFormSubmitted}
            >
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    errors,
                }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>

                            <OverlayTrigger
                                placement='top'
                                overlay={<Popover>
                                    <Popover.Header>
                                        Current Password
                                    </Popover.Header>
                                    <Popover.Body>
                                        The current password for your user account.
                                    </Popover.Body>
                                </Popover>}>
                            <Form.Control
                                type="password"
                                placeholder="Current Password"
                                name="currentPassword"
                                value={values.currentPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}/>
                            </OverlayTrigger>

                            <Form.Control.Feedback type="invalid" style={{ display: errors.currentPassword && touched.currentPassword ? 'block' : 'none' }}>
                                {errors.currentPassword}
                            </Form.Control.Feedback>

                            <p 
                                className="text-danger mt-2" 
                                style={{ fontSize: 14, display: showPasswordError ? 'block': 'none' }}
                            >
                                Wrong password
                            </p>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <OverlayTrigger
                                placement='top'
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
                                placeholder="New Password"
                                name="newPassword"
                                value={values.newPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}/>
                            </OverlayTrigger>

                            <Form.Control.Feedback type="invalid" style={{ display: errors.newPassword && touched.newPassword ? 'block' : 'none' }}>
                                {errors.newPassword}
                            </Form.Control.Feedback>

                            <p
                                className="text-danger mt-2"
                                style={{ fontSize: 14, display: error ? 'block': 'none' }}
                            >
                                {error}
                            </p>
                        </Form.Group>

                        <Button type="submit">Change</Button>
                    </Form>
                )}
            </Formik>
        </Container>
    );
}