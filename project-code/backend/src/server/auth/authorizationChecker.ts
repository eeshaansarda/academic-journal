import {Action} from "routing-controllers";
import {Request, Response} from "express";
import { SESSION_COOKIE_NAME } from "@config/cookies";
import {plainToInstance} from "class-transformer";
import {SessionUser} from "@validation/session/SessionUser";
import {validateOrReject} from "class-validator";
import jwt, {JwtPayload} from "jsonwebtoken";
import {UserModel} from "@models/user/userModel";

/**
 * Checks if a request has authorization to be made,
 * @param action The 'action' object. Contains the request and response.
 * @param roles The required roles array.
 * @returns Promise with whether the request is authorized.
 */
export default async function checkAuth(action: Action, roles: number[]): Promise<boolean> {
    const req: Request = action.request;
    const res: Response = action.response;

    if (req.cookies[SESSION_COOKIE_NAME]) {
        const jwt = req.cookies['session'];

        let data;
        let user;

        try {
            data = await verifyJWT(jwt);
            user = plainToInstance(SessionUser, data, { excludeExtraneousValues: true });
            await validateOrReject(user);

            const userModel = await UserModel.findOne({ id: user.id });
            const banned = await userModel?.isBanned();

            if (!userModel || banned)
                throw new Error ("user does not exist / is banned");

        } catch (err) {
            res.clearCookie(SESSION_COOKIE_NAME);
            return false;
        }

        if (roles.length === 1 && (roles[0] & user.role) !== roles[0]) {
            return false;
        }

        (req as any).user = user;
        return true;
    }
    return false;
}

/**
 * Verifies a JWT.
 * @param token The JWT token to verify.
 * @returns Promise that resolves with the contents of the JWT or rejects
 * with the error.
 */
export async function verifyJWT(token: string): Promise<JwtPayload | undefined> {
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

