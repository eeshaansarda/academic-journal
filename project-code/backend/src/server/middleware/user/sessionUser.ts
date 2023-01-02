import {ExpressMiddlewareInterface} from "routing-controllers";
import {SESSION_COOKIE_NAME} from "@config/cookies";
import {verifyJWT} from "@server/auth/authorizationChecker";
import {plainToInstance} from "class-transformer";
import {validateOrReject} from "class-validator";
import {SessionUser} from "@validation/session/SessionUser";
import { Service } from "typedi";

@Service()
export default class SessionUserMiddleware implements ExpressMiddlewareInterface {
    
    /**
     * Attempts to extract the session user from a given request (via the
     * session cookie). Clears the session cookie if it is invalid or malformed.
     * @param request The request.
     * @param response The response.
     * @param next The 'next' function in the pipeline.
     */
    async use(request: any, response: any, next: (err?: any) => any): Promise<void> {
        if (request.cookies[SESSION_COOKIE_NAME]) {
            const jwt = request.cookies['session'];

            let data;
            let user;
            try {
                data = await verifyJWT(jwt);
                user = plainToInstance(SessionUser, data, { excludeExtraneousValues: true });
                await validateOrReject(user);
            } catch (err) {
                response.clearCookie(SESSION_COOKIE_NAME);
                next();
                return;
            }

            (request as any).user = user;
            next();
        }
        next();
    }
}