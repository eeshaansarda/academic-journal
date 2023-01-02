import LogoTitle from "@components/logo/LogoTitle";
import { UserService } from "@services/user/userService";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";

export default function VerifyEmail() {
    const location = useLocation();
    const userService = new UserService();
    const [ message, setMessage ] = useState('');
    const [ isErrorMessage, setErrorMessage ] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.has('id') ? queryParams.get('id') : null;
    const token = queryParams.has('token') ? queryParams.get('token') : null;
    
    useEffect(() => {
        if (userId && token) {
            verifyEmail(userId, token);
        } else {
            setErrorMessage(true);
            setMessage('Failed to verify email, link is invalid');
        }
    })

    /**
     * Attempts to verify a user's email.
     * @param userId The user's ID.
     * @param token The email verification token.
     */
    function verifyEmail(userId: string, token: string) {
        userService.verifyEmail(userId, token)
            .then(res => {
                if (res.data.status && res.data.status == 'success') {
                    setMessage('Thanks for verifying your email. You may now close this tab.')
                } else {
                    setErrorMessage(true);
                    setMessage('Failed to verify email, link may be invalid or malformed');
                }
            })
            .catch(_ => {
                setErrorMessage(true);
                setMessage('Failed to verify email, link may be invalid or malformed');
            });
    }

    return (
        <Container>
            <LogoTitle title="Email Verification" />

            <p 
                style={{ textAlign: 'center', color: isErrorMessage ? '#cb444b' : '#53a451' }}
            >
                {message}
            </p>
        </Container>
    );
}