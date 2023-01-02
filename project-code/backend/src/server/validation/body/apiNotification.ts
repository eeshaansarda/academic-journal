import {IsDefined, IsEnum, Min} from "class-validator";
import {INotification, NotificationType} from "@models/notification/notificationModel";

/**
 * Represents a notification that has been read.
 */
export class ApiReadNotification {
    @IsDefined()
    @Min(0)
    notificationId: number;
}

/**
 * Represents a notification.
 */
export class ApiNotification {
    @IsDefined()
    notificationId: number;

    @IsDefined()
    message: string;

    @IsDefined()
    user: string;

    @IsDefined()
    seen: boolean;

    url?: string;

    @IsDefined()
    @IsEnum(NotificationType)
    type: NotificationType;

    /**
     * Creates a notification (to be returned from the API) from a stored
     * notification.
     * @param document The stored notification.
     * @returns The notification.
     */
    public static createApiNotificationFromDocument(document: INotification): ApiNotification {
        return {
            notificationId: document.id,
            message: document.message,
            user: document.user,
            url: document.url,
            type: document.type,
            seen: document.seen
        };
    }
}