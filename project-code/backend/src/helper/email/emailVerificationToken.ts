import { IUser } from '@server/models/user/userModel';
import jwt from "jsonwebtoken";

export interface EmailVerificationData {
    id: string;
    email: string;
}

export class EmailVerificationToken {

    /**
     * Generates an email verification token that expires in 1 week.
     * @param user The user.
     * @returns The generated token.
     */
    static generate(user: IUser): Promise<string> {
        return new Promise((res, rej) => {
            jwt.sign({ id: user.id, email: user.email },
                process.env.JWT_SECRET as string, { expiresIn: '7d' }, (err, token) => {
                    if (err || token === undefined) rej(err);
                    res(token as string);
                });
        });
    }
    
    /**
     * Attempts to decode a forgotten password token.
     * @param token The token.
     * @returns The decoded data.
     */
    static decode(token: string): Promise<EmailVerificationData> {
        return new Promise<EmailVerificationData>((res, rej) => {
            jwt.verify(token, process.env.JWT_SECRET as string,
                (err, decoded) => {
                    if (err) {
                        rej(err);
                    }
                    res(decoded as EmailVerificationData);
                });
        });
    }
}