import {
    Authorized,
    BodyParam,
    CurrentUser,
    Get,
    JsonController,
    NotFoundError,
    Put
} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {IUserModel, UserModel} from "@models/user/userModel";
import {Service} from "typedi";

@JsonController("/user/dashboard")
@Service()
export default class DashboardController {
    public static readonly GET_DASHBOARD_ENDPOINT = "/";

    public userModel: IUserModel = UserModel;

    /**
     * Endpoint to get a user's dashboard preferences.
     * @param currentUser The user who made the request.
     */
    @Authorized()
    @Get(DashboardController.GET_DASHBOARD_ENDPOINT)
    public async getDashboard(@CurrentUser({ required: true }) currentUser: SessionUser) {
        const user = await this.userModel.getUserFromId(currentUser.id);

        if (!user)
            throw new NotFoundError("the session user does not exist");

        return {
            status: "success",
            dashboard: user.dashboard
        };
    }

    /**
     * Endpoint for a user to update their dashboard preferences.
     * @param currentUser The user who made the request.
     * @param dashboard The dashboard preferences.
     */
    @Authorized()
    @Put(DashboardController.GET_DASHBOARD_ENDPOINT)
    public async setDashboard(@CurrentUser({ required: true }) currentUser: SessionUser,
                              @BodyParam("dashboard", { required: true }) dashboard: string) {
        await this.userModel.setDashboard(currentUser.id, dashboard);

        return {
            status: "success"
        };
    }
}