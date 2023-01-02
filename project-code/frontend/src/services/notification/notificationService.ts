import {AxiosInstance, AxiosResponse} from "axios";
import {axiosInstance} from "@services/axiosInstance";
import {notificationsEndpoint, readNotificationEndpoint} from "@root/config";

export interface INotificationService {
    getNotifications: () => Promise<AxiosResponse>;
}

export default class NotificationService implements INotificationService {
    public api: AxiosInstance = axiosInstance;

    getNotifications(): Promise<AxiosResponse> {
        return this.api.get(notificationsEndpoint);
    }

    setSeen(notificationId: number): Promise<AxiosResponse> {
        return this.api.put(readNotificationEndpoint, { notificationId }, { withCredentials: true });
    }
}