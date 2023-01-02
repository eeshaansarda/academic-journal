export enum NotificationType {
    SUBMISSION = "SUBMISSION",
    PUBLICATION = "PUBLICATION",
    REVIEW = "REVIEW",
    MISC = "MISC"
}

export interface Notification {
    notificationId: number;
    message: string;
    user: string;
    url?: string;
    type: NotificationType;
    seen: boolean;
}