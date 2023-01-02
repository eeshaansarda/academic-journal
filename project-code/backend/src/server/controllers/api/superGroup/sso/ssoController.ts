import {Request, Response} from 'express';
import {createCookieResponse, generateSessionCookie} from "@server/authorization/authorization";
import {IUserRepository, UserModel} from '@models/user/userModel';
import { config } from "@config/config";
import {SSO_COOKIE_NAME} from "@config/cookies";
import {
    Authorized,
    BadRequestError, CookieParam,
    CurrentUser,
    ForbiddenError,
    Get, JsonController,
    Post, QueryParam,
    QueryParams,
    Req,
    Res, UseBefore
} from "routing-controllers";
import {SsoCallbackQuery, SsoConfirmQuery, SsoLoginQuery} from "@validation/query/ssoLoginQuery";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiUser} from "@validation/body/apiUser";
import {ISsoToken, SsoToken} from "@helper/sso/ssoToken";
import {Service} from "typedi";
import {URL} from "url";
import {ServerError} from "@server/errors/serverError";
import SessionUserMiddleware from "@middleware/user/sessionUser";

@JsonController("/sg/sso")
@Service()
export default class SsoController {
    public static readonly LOGIN_PATH = '/login';
    public static readonly CONFIRM_PATH = '/confirm';
    public static readonly VERIFY_PATH = '/verify';
    public static readonly CALLBACK_PATH = '/callback';

    public userModel: IUserRepository = UserModel;
    public ssoToken: ISsoToken = new SsoToken();

    /**
     * Endpoint for a user to login from another journal.
     * @param loginQuery The query parameters.
     * @param sessionUser The user who made the request.
     * @param res The response.
     */
    @Get(SsoController.LOGIN_PATH)
    @UseBefore(SessionUserMiddleware)
    public async login(@QueryParams() loginQuery: SsoLoginQuery,
                       @CurrentUser({ required: false }) sessionUser: SessionUser | null,
                       @Res() res: Response) {

        if (sessionUser) {
            // user is already logged in, redirect them to the confirm SSO page
            const confirmUrl = `${config.journalUrl}/confirm_sso?redirectUrl=${encodeURIComponent(loginQuery.from)}&state=${encodeURIComponent(loginQuery.state)}`;
            return res.redirect(confirmUrl);
        }

        const loginUrl = `${config.journalUrl}/login?sso=true&redirectUrl=${encodeURIComponent(loginQuery.from)}&state=${encodeURIComponent(loginQuery.state)}`;
        res.redirect(loginUrl);
        return res;
    }

    /**
     * Endpoint to confirm an SSO login.
     * @param confirmQuery The query parameters.
     * @param sessionUser The user who made the request.
     * @param response The response.
     */
    @Get(SsoController.CONFIRM_PATH)
    @Authorized()
    public async confirm(@QueryParams() confirmQuery: SsoConfirmQuery,
                         @CurrentUser({ required: true }) sessionUser: SessionUser,
                         @Res() response: Response) {

        const ssoToken = await this.ssoToken.generateSsoToken(sessionUser, confirmQuery.state);

        const primaryJournalUrl = new URL(`/api/sg/sso/callback?token=${encodeURIComponent(ssoToken)}&state=${encodeURIComponent(confirmQuery.state)}&from=${encodeURIComponent(config.journalUrl)}`,
            confirmQuery.redirectUrl);
        response.redirect(primaryJournalUrl.toString());
        return response;
    }

    /**
     * Endpoint to verify an SSO login is authorised.
     * @param token The SSO token.
     */
    @Post(SsoController.VERIFY_PATH)
    public async verify(@QueryParam("token", { required: true }) token: string) {
        let data;
        try {
            data = await this.ssoToken.decodeSsoToken(token);
        } catch {
            throw new ForbiddenError("the token is invalid");
        }

        if (!data)
            throw new ForbiddenError("the token is invalid");

        const user = await this.userModel.getOne({ id: data.id });

        if (!user)
            throw new ServerError('the user does not exist');

        return {
            status: 'ok',
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            profilePictureUrl: user.profile.profilePicture.url
        };
    }

    /**
     * Endpoint that acts as the callback for an SSO login.
     * @param callBackQuery The query parameters.
     * @param req The request.
     * @param res The response.
     * @param ssoCookie The SSO cookie.
     */
    @Get(SsoController.CALLBACK_PATH)
    public async callback(@QueryParams() callBackQuery: SsoCallbackQuery,
                          @Req() req: Request,
                          @Res() res: Response,
                          @CookieParam(SSO_COOKIE_NAME, { required: true }) ssoCookie: string) {
        let ssoData;
        try {
            ssoData = JSON.parse(ssoCookie);
        } catch (err) {
            throw new ForbiddenError("invalid state param");
        }

        const { state: expectedState, url: journalUrl } = ssoData;

        // ensure state values match
        if (!expectedState || callBackQuery.state != expectedState) {
            throw new ForbiddenError("invalid state param");
        }

        const user = await this.ssoToken.checkSsoToken(callBackQuery.token, journalUrl);
        if (user) {
            let userModel = await this.userModel.getOne({ id: user.id });

            // add user to our database if they don't already exist
            if (!userModel) {
                try {
                    userModel = await this.userModel.createFromApiUser(user);
                } catch (err) {
                    throw new BadRequestError("Invalid user details");
                }
            }

            const token = await generateSessionCookie(ApiUser.createApiUserFromDocument(userModel));
            createCookieResponse(res, token).redirect(`${config.journalUrl}/dashboard`);
            return res;
        }
        throw new ForbiddenError("Invalid or expired SSO token");
    }
}