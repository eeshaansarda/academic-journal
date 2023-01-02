import {ApiUser} from "@validation/body/apiUser";
import jwt, {JwtPayload} from "jsonwebtoken";
import {SessionUser} from "@validation/session/SessionUser";
import axios from "axios";
import {UserRole} from "@models/user/userModel";

interface SsoResponse extends SsoUser {
    status: string;
}

interface SsoUser {
    id: string;
    email: string;
    username: string;
    name: string;
    profilePictureUrl: string;
}

export interface ISsoToken {
    checkSsoToken(token: string, journalUrl: string): Promise<ApiUser | false>;
    decodeSsoToken(token: string): Promise<JwtPayload | undefined>;
    generateSsoToken(user: SessionUser, state: string): Promise<string>;
}

export class SsoToken implements ISsoToken {

    /**
     * Checks if an SSO token for logging in with another journal is valid.
     * @param token The JWT SSO token.
     * @param journalUrl The URL of the other journal.
     * @returns Promise that resolves with the corresponding user details if 
     * if the token is valid, or false if the token was invalid.
     */
    checkSsoToken(token: string, journalUrl: string): Promise<ApiUser | false> {
        return new Promise(res => {
            const url = `${journalUrl}/api/sg/sso/verify`;
            axios.post<SsoResponse>(url, null, {
                params: {
                    token: token
                }
            }).then((response) => {
                if (!response.data.status || response.data.status != 'ok') {
                    res(false);
                } else {
                    const { id, email, username, name, profilePictureUrl } = response.data;

                    if (!id) { // id must be provided
                        res(false);
                    }

                    let firstName, lastName;
                    if (name.includes(' ')) {
                        [ firstName, lastName ] = name.split(' ');
                    } else {
                        firstName = name;
                        lastName = 'Not provided';
                    }

                    const user: ApiUser = {
                        id: id,
                        username: username || name.replace(/\s/g, ''),
                        email: email || `Not provided, id: ${id}`,
                        firstName: firstName,
                        lastName: lastName,
                        role: UserRole.USER,
                        homeJournal: id.slice(-3),
                        hasVerifiedEmail: false,
                        profilePictureUrl: profilePictureUrl || 'https://avatars.githubusercontent.com/u/23016414?s=200&v=4'
                    };

                    res(user);
                }
            }).catch(_ => res(false));
        });
    }

    /**
     * Decodes a JWT SSO token.
     * @param token The SSO token.
     * @returns Promise that resolves with either the contents of the JWT
     * token if it is valid, or rejects otherwise.
     */
    decodeSsoToken(token: string): Promise<JwtPayload | undefined> {
        return new Promise<JwtPayload | undefined>((res, rej) => {
            jwt.verify(token, process.env.JWT_SECRET as string,
                (err, decoded) => {
                    if (err) {
                        rej(err);
                    }
                    res(decoded);
                });
        });
    }

    /**
     * Generates an SSO token for a given user.
     * @param user The user.
     * @param state The 'state' value.
     * @returns Promise that resolves with the SSO token.
     */
    generateSsoToken(user: SessionUser, state: string): Promise<string> {
        return new Promise((res, rej) => {
            jwt.sign({ id: user.id, state: state },
                process.env.JWT_SECRET as string, { expiresIn: '5m' }, (err, token) => {
                    if (err || token === undefined) rej(err);
                    res(token as string);
                });
        });
    }
}