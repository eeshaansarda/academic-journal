import {Authorized, BodyParam, CurrentUser, Get, JsonController, Put, Res} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {IUserRepository, UserModel} from "@models/user/userModel";
import {ServerError} from "@errors/serverError";
import {Service} from "typedi";
import {Response} from "express";
import {promisify} from "util";
import path from "path";

@JsonController("/user/theme")
@Service()
export default class ThemeController {
    public static readonly GET_THEME_ENDPOINT = "/";
    public static readonly PUT_THEME_ENDPOINT = "/";
    public static readonly GET_TEAM_15_ENDPOINT = "/team_15";

    public userModel: IUserRepository = UserModel;

    /**
     * Endpoint to get a user's theme.
     * @param sessionUser The user who made the request.
     */
    @Get(ThemeController.GET_THEME_ENDPOINT)
    @Authorized()
    public async getTheme(@CurrentUser({ required: true }) sessionUser: SessionUser) {
        const user = await this.userModel.getUserFromId(sessionUser.id);

        if (!user)
            throw new ServerError("something went wrong");

        return {
            status: "success",
            theme: user.theme
        };
    }

    /**
     * Endpoint to set a user's theme.
     * @param sessionUser The user who made the request.
     * @param theme The theme to set.
     */
    @Put(ThemeController.PUT_THEME_ENDPOINT)
    @Authorized()
    public async putTheme(@CurrentUser({ required: true }) sessionUser: SessionUser,
                          @BodyParam("theme", { required: true }) theme: string) {
        const user = await this.userModel.getUserFromId(sessionUser.id);

        if (!user)
            throw new ServerError("something went wrong");

        user.theme = theme;
        await user.save();

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to get the custom Team 15 theme CSS file.
     * @param res The response.
     */
    @Get(ThemeController.GET_TEAM_15_ENDPOINT)
    public async getCss(@Res() res: Response) {
        await promisify(res.sendFile.bind(res))(path.join(process.cwd(), "./theme/team_15_theme.css"));
        return res;
    }
}