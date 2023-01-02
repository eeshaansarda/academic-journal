import {IUserRepository, UserModel, UserRole} from "@models/user/userModel";
import {BanModel, IBanRepository} from "@models/ban/banModel";
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser, Get,
    JsonController,
    NotFoundError,
    Post,
    QueryParams
} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiBan, ApiRevokeBan} from "@validation/body/apiBan";
import {GetBansQuery} from "@validation/query/getBansQuery";
import {Service} from "typedi";
import SocketService from "@server/services/socketService";

@JsonController("/ban")
@Service()
export default class BanController {
    private static readonly BAN_USER_ENDPOINT = "/ban_user";
    private static readonly REVOKE_BAN_ENDPOINT = "/revoke";
    private static readonly VIEW_BANS_ENDPOINT = "/view_bans";

    public banModel: IBanRepository = BanModel;
    public userModel: IUserRepository = UserModel;

    /**
     * Creates a new ban controller.
     * @param socketService The socket service (injected).
     */
    constructor(private readonly socketService: SocketService) {}

    /**
     * Endpoint to ban a user. Admin only.
     * @param sessionUser The user who made the request.
     * @param apiBan The request body.
     */
    @Authorized(UserRole.ADMIN)
    @Post(BanController.BAN_USER_ENDPOINT)
    public async banUser(@CurrentUser({ required: true }) sessionUser: SessionUser,
                         @Body() apiBan: ApiBan) {
        const adminUserModel = await this.userModel.getOne({ id: sessionUser.id });
        if (!adminUserModel) {
            throw new NotFoundError("the session user does not exist");
        }

        const userModel = await this.userModel.getOne({ id: apiBan.id });
        if (!userModel)
            throw new NotFoundError("the user to ban could not be found");

        try {
            const banModel = await this.banModel.createOne({
                reason: apiBan.reason,
                subject: userModel._id,
                issuer: adminUserModel._id,
                expiry: apiBan.expiry as any
            });
            await userModel.save();

            // kick the user out
            this.socketService.clearSessions(userModel.id);

            return {
                status: 'success',
                banId: banModel.id
            };
        } catch (err) {
            throw new BadRequestError((err as Error).message);
        }
    }

    /**
     * Endpoint to revoke a ban. Admin only.
     * @param revokeBan The request body.
     */
    @Authorized(UserRole.ADMIN)
    @Post(BanController.REVOKE_BAN_ENDPOINT)
    public async revokeBan(@Body() revokeBan: ApiRevokeBan) {

        const ban = await this.banModel.getOne({ id: revokeBan.id });
        if (!ban)
            throw new NotFoundError("the ban specified does not exist");

        await this.userModel.removeBan(ban);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to view a list of bans. Admin only.
     * @param getBansQuery The query parameters.
     */
    @Authorized(UserRole.ADMIN)
    @Get(BanController.VIEW_BANS_ENDPOINT)
    public async viewBans(@QueryParams() getBansQuery : GetBansQuery) {
        const bans = await this.banModel.getBans(getBansQuery.pageNumber);

        const now = Date.now();
        const apiBans = [];
        for (const ban of bans) {
            if (now > (ban.expiry as any).getTime()) {
                await this.userModel.removeBan(ban);
                continue;
            }

            apiBans.push(ApiBan.createApiBanFromDocument(ban));
        }

        const numBans = await this.banModel.numDocuments();

        return {
            status: 'success',
            bans: apiBans,
            numBans
        };
    }
}