import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController,
    NotFoundError,
    Post,
    QueryParam
} from "routing-controllers";
import {Service} from "typedi";
import {UserDoesNotExistError, UserRole} from "@models/user/userModel";
import {SessionUser} from "@validation/session/SessionUser";
import ApiAnnouncement from "@validation/body/apiAnnouncement";
import {AnnouncementModel, IAnnouncementRepository} from "@models/announcements/announcementModel";
import SocketService from "@server/services/socketService";

@JsonController("/announcement")
@Service()
export default class AnnouncementController {
    private static readonly CREATE_ANNOUNCEMENT_ENDPOINT = "/";
    private static readonly GET_ANNOUNCEMENT_ENDPOINT = "/";

    public announcementModel: IAnnouncementRepository = AnnouncementModel;

    /**
     * Creates a new announcement controller.
     * @param socketService The socket service (injected).
     */
    constructor(private readonly socketService: SocketService) {}

    /**
     * Endpoint to create an announcement. Admin only.
     * @param user The user who made the request.
     * @param apiAnnouncement The request body.
     */
    @Authorized(UserRole.ADMIN)
    @Post(AnnouncementController.CREATE_ANNOUNCEMENT_ENDPOINT)
    public async createAnnouncement(@CurrentUser({ required: true }) user: SessionUser,
                                    @Body({ required: true }) apiAnnouncement: ApiAnnouncement) {

        let announcement;
        try {
            announcement = await this.announcementModel.createAnnouncement(apiAnnouncement, user.id);
            this.socketService.newAnnouncement(announcement);
        } catch (e) {
            if (e instanceof UserDoesNotExistError)
                throw new NotFoundError("the given user does not exist");

            throw new BadRequestError((e as Error).message);
        }

        return {
            status: "success",
            announcementId: announcement.id
        };
    }

    /**
     * Endpoint to get an announcement.
     * @param announcementId The ID of the announcement.
     */
    @Authorized()
    @Get(AnnouncementController.GET_ANNOUNCEMENT_ENDPOINT)
    public async getAnnouncement(@QueryParam("announcementId", { required: true }) announcementId: string) {
        const announcement = await this.announcementModel.getOneAndPopulate({ id: announcementId });

        if (!announcement)
            throw new NotFoundError("the given announcement does not exist");

        return {
            status: "success",
            announcement: ApiAnnouncement.createApiAnnouncementFromDocument(announcement),
        };
    }
}