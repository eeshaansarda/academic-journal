import {BaseRepository} from "@models/baseRepository";
import {FilterQuery, model, Model, Schema, UpdateQuery} from "mongoose";
import moment from "moment";

export enum NotificationType {
    SUBMISSION = "SUBMISSION",
    PUBLICATION = "PUBLICATION",
    REVIEW = "REVIEW",
    MISC = "MISC"
}

export interface INotification extends Document {
    id: number;
    message: string;
    seen: boolean;
    user: string;
    url?: string;
    type: NotificationType;
}

export interface INotificationRepository extends BaseRepository<INotification> {
    readNotification: (user: string, notificationId: number) => Promise<void>;
    getNotificationsInLastWeek: (user: string) => Promise<INotification[]>;
}

export type INotificationModel = INotificationRepository & Model<INotification>;

/**
 * The notification schema.
 */
const notificationSchema = new Schema<INotification, INotificationModel>({
    id: { type: Number, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    seen: { type: Boolean, required: true },
    user: { type: String, required: true, trim: true },
    url: { type: String, required: false, trime: true },
    type: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at' } });
notificationSchema.index({ id: 1, user: 1 }, { unique: true });

/**
 * Modifies a notification.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified notification.
 */
notificationSchema.statics.modifyOne = (filterQuery: FilterQuery<INotification>, updateQuery: UpdateQuery<INotification>) => NotificationModel.updateOne(filterQuery, updateQuery);

/**
 * Removes a notification.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed notification.
 */
notificationSchema.statics.removeOne = (filterQuery: FilterQuery<INotification>) => NotificationModel.deleteOne(filterQuery);

/**
 * Creates a new notification.
 * @param data The notification data.
 * @returns Promise that resolves with the created notfication.
 */
notificationSchema.statics.createOne = async (data: Partial<INotification>) => {
    const id = await NotificationModel.count({ user: data.user });
    const notification = new NotificationModel({ ...data, id });
    await notification.save();
    return notification;
};

/**
 * Gets a notification.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the notification.
 */
notificationSchema.statics.getOne = (filterQuery: FilterQuery<INotification>) => NotificationModel.findOne(filterQuery);

/**
 * Gets a list of notifications.
 * @param filterQuery The fitler query.
 * @returns Promise that resolves with the list of notifications.
 */
notificationSchema.statics.get = (filterQuery: FilterQuery<INotification>) => NotificationModel.find(filterQuery);

export class NotificationDoesNotExistError extends Error {}

/**
 * Marks a notification as read by a user.
 * @param user The ID of the user.
 * @param notificationId The ID of the notification.
 */
notificationSchema.statics.readNotification = async (user: string, notificationId: number) => {
    const notification = await NotificationModel.findOne({ id: notificationId, user });

    if (!notification)
        throw new NotificationDoesNotExistError();

    notification.seen = true;
    await notification.save();
};

/**
 * Gets a list of notifications in the last week for a user.
 * @param user The ID of the user.
 * @returns Promise that resolves with the list of notifications.
 */
notificationSchema.statics.getNotificationsInLastWeek = async (user: string) => {
    return NotificationModel
        .find({
            user,
            timestamp: {
                $gte: moment().day(-7)
            }
        })
        .sort({ created_at: -1 });
}

export const NotificationModel = model<INotification, INotificationModel>('Notification', notificationSchema);
