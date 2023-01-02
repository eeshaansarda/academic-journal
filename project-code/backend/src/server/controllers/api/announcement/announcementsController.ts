import {Authorized, Get, JsonController} from "routing-controllers";
import {Service} from "typedi";
import {AnnouncementModel, IAnnouncementRepository} from "@models/announcements/announcementModel";
import ApiAnnouncement from "@validation/body/apiAnnouncement";

@JsonController("/announcements")
@Service()
export default class AnnouncementsController {
    private static readonly GET_ANNOUNCEMENTS_ENDPOINT = "/";

    public announcementModel: IAnnouncementRepository = AnnouncementModel;

    /**
     * Endpoint to get a list of announcements.
     */
    @Authorized()
    @Get(AnnouncementsController.GET_ANNOUNCEMENTS_ENDPOINT)
    public async getAnnouncements() {
        const announcements = await this.announcementModel.getAnnouncements({});
        const apiAnnouncements = announcements.map(announcement => ApiAnnouncement.createApiAnnouncementFromDocument(announcement));

        return {
            status: "success",
            announcements: apiAnnouncements
        };
    }
}