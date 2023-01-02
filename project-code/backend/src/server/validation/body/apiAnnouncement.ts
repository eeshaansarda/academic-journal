import {IsDefined} from "class-validator";
import {IAnnouncement} from "@models/announcements/announcementModel";
import {IUser} from "@models/user/userModel";

/**
 * Represents an announcement.
 */
export default class ApiAnnouncement {
    @IsDefined()
    content: string;

    @IsDefined()
    title: string;

    id: string;

    author: { id: string, username: string };

    published: Date;

    /**
     * Creates an announcement (to be returned from the API) from an 
     * stored announcement.
     * @param document The stored announcement.
     * @returns The announcement.
     */
    public static createApiAnnouncementFromDocument(document: IAnnouncement) {
        const author = document.author as IUser;

        return {
            content: document.content,
            title: document.title,
            id: document.id,
            author: {
                id: author.id,
                username: author.username
            },
            published: (document as any).created_at.valueOf()
        };
    }
}