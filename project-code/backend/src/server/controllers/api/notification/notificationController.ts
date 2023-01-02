import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController,
    NotFoundError,
    Put
} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {INotificationRepository, NotificationModel} from "@models/notification/notificationModel";
import {ApiNotification, ApiReadNotification} from "@validation/body/apiNotification";
import {Service} from "typedi";

@JsonController("/notification")
@Service()
export default class NotificationController {
    public static readonly GET_NOTIFICATIONS = "/";
    public static readonly READ_NOTIFICATION = "/read";

    public notificationModel: INotificationRepository = NotificationModel;

    /**
     * Endpoint to get a list of notifications for a user.
     * @param user The user who made the request.
     */
    @Get(NotificationController.GET_NOTIFICATIONS)
    @Authorized()
    public async getNotificationsForUser(@CurrentUser({ required: true }) user: SessionUser) {
        const notifications = await this.notificationModel.getNotificationsInLastWeek(user.id);

        return {
            status: "success",
            notifications: notifications.map(notification => ApiNotification.createApiNotificationFromDocument(notification))
        }
    }

    /**
     * Endpoint to mark a notification as read for a user.
     * @param user The user who made the request.
     * @param readNotification The request body.
     */
    @Put(NotificationController.READ_NOTIFICATION)
    @Authorized()
    public async readNotification(@CurrentUser({ required: true }) user: SessionUser,
                                  @Body({ required: true }) readNotification: ApiReadNotification) {
        try {
            await this.notificationModel.readNotification(user.id, readNotification.notificationId);
        } catch (e) {
            if (e instanceof NotFoundError)
                throw new NotFoundError((e as Error).message);

            throw new BadRequestError((e as Error).message);
        }

        return {
            status: "success"
        };
    }
}