import axios, {AxiosResponse} from "axios";
import {announcementEndpoint, announcementsEndpoint} from "@root/config";
import {AnnouncementForm} from "@pages/announcement/create/CreateAnnouncement";

export interface IAnnouncementService {
    getAnnouncement: (announcementId: string) => Promise<AxiosResponse>;
    createAnnouncement: (formData: AnnouncementForm) => Promise<AxiosResponse>;
    getAnnouncements: () => Promise<AxiosResponse>;
}

export class AnnouncementService implements IAnnouncementService {
    getAnnouncement(announcementId: string): Promise<AxiosResponse> {
        return axios.get(announcementEndpoint, {
            params: {
                announcementId
            },
            withCredentials: true
        });
    }

    createAnnouncement(formData: AnnouncementForm): Promise<AxiosResponse> {
        return axios.post(announcementEndpoint, formData, { withCredentials: true });
    }

    getAnnouncements(): Promise<AxiosResponse> {
        return axios.get(announcementsEndpoint, { withCredentials: true });
    }
}