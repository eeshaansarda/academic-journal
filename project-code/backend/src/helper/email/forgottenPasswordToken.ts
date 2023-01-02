import { IUser } from '@server/models/user/userModel';
import jwt from "jsonwebtoken";

export interface ForgottenPasswordData {
    id: string;
}

export class ForgottenPasswordToken {

    /**
     * Generates a forgotten password token that expires in 10 minutes.
     * @param user The user who has forgotten their password.
     * @returns The generated token.
     */
    static generate(user: IUser): Promise<string> {
        return new Promise((res, rej) => {
            jwt.sign({ id: user.id },
                process.env.JWT_SECRET as string, { expiresIn: '10m' }, (err, token) => {
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
    static decode(token: string): Promise<ForgottenPasswordData> {
        return new Promise<ForgottenPasswordData>((res, rej) => {
            jwt.verify(token, process.env.JWT_SECRET as string,
                (err, decoded) => {
                    if (err) {
                        rej(err);
                    }
                    res(decoded as ForgottenPasswordData);
                });
        });
    }
}