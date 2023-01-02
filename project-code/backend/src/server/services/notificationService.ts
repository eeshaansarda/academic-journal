import { Service } from 'typedi';
import Bull from 'bull';
import {NotificationModel, NotificationType} from "@models/notification/notificationModel";
import SocketService from './socketService';
import { config } from "@config/config";

export interface INotificationService {
    pushNotification: (message: string, user: string, type: NotificationType, url?: string) => void;
    pushNotificationForUsers: (message: string, users: string[], type: NotificationType, url?: string) => void;
}

@Service()
export default class NotificationService implements INotificationService {
    private queue: Bull.Queue<Notification>;

    /**
     * Creates a new notification service.
     * @param socketService The socket service (injected).
     */
    constructor(private readonly socketService: SocketService) {
        this.queue = new Bull('notification', config.redisServer);
        this.setUp();
    }

    /**
     * Initialises the redis notification queue.
     */
    private setUp(): void {
        const socketService = this.socketService;
        this.queue.process(async function (job) {
            const notification = await NotificationModel.createOne({ ...job.data, seen: false });
            socketService.newNotification(job.data.user, notification);
        });
    }

    /**
     * Sends a notification to a user.
     * @param message The content of the notification.
     * @param type The notification type.
     * @param user The user to send the notification to.
     */
    public pushNotification(message: string, user: string, type: NotificationType, url?: string): void {
        const notification: Notification = { message, user, type };
        if (url) {
            notification.url = url;
        }
        this.queue.add(notification);
    }

    /**
     * Sends a notification to multiple users.
     * @param message The content of the notification.
     * @param type The notification type.
     * @param users The users to send the notification to.
     */
    public pushNotificationForUsers(message: string, users: string[], type: NotificationType, url?: string): void {
        users.forEach(user => {
            const notification: Notification = { message, user, type };
            if (url) {
                notification.url = url;
            }
            this.queue.add(notification);
        });
    }
}

interface Notification {
    message: string;
    user: string;
    url?: string;
    type: NotificationType;
}