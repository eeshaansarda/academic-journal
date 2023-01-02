import { Response } from 'express';
import jwt from "jsonwebtoken";
import {SESSION_COOKIE_NAME} from "@config/cookies";
import {ApiUser} from "@validation/body/apiUser";
import {instanceToPlain} from "class-transformer";
import {SessionUser} from "@validation/session/SessionUser";

const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

export interface ICookieProvider {
    genSessionCookie(user: ApiUser | SessionUser): Promise<string>;
    createSessionCookie(res: Response, cookie: string): Response;
    clearCookie(res: Response, cookie: string): Response;
}

export class CookieProvider implements ICookieProvider {
    genSessionCookie = generateSessionCookie;
    createSessionCookie = createCookieResponse;

    /**
     * Clears a user's cookie.
     * @param res The response.
     * @param cookie The name of the cookie to be removed.
     * @returns The updated response.
     */
    public clearCookie(res: Response, cookie: string): Response {
        return res.clearCookie(cookie);
    }
}

/**
 * Generates a JWT session cookie.
 * @param user The user details.
 * @returns A promise that resolves with the session cookie or rejects with
 * the error.
 */
export async function generateSessionCookie(user: ApiUser | SessionUser): Promise<string> {
    return new Promise((res, rej) => {
        jwt.sign(instanceToPlain(user, { excludeExtraneousValues: true }), process.env.JWT_SECRET as string, { expiresIn: '2h' },
            (err, token) => {
                if (err || token === undefined) rej(err);
                res(token as string);
            });
    });
}

/**
 * Sets a cookie on a given response.
 * @param res The response.
 * @param cookie The cookie to be set.
 * @returns The updated response.
 */
export function createCookieResponse(res: Response, cookie: string): Response {
    return res.cookie(SESSION_COOKIE_NAME, cookie, {
        maxAge: WEEK_IN_MILLISECONDS,
        httpOnly: true
    });
}
