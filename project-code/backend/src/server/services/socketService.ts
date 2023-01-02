import { Service } from "typedi";
import { Server, Socket } from 'socket.io';
import WebServer from '@server/server';
import { IMessage, IPrivateDiscussion } from "@server/models/message/privateDiscussionModel";
import { ApiMessage } from "@server/validation/body/apiPrivateDiscussion";
import { IUser } from "@server/models/user/userModel";
import { IAnnouncement } from "@server/models/announcements/announcementModel";
import ApiAnnouncement from "@server/validation/body/apiAnnouncement";
import { INotification } from "@server/models/notification/notificationModel";
import { ApiNotification } from "@server/validation/body/apiNotification";

export interface ISocketService {
    newPrivateMessage(discussionId: string, message: IMessage): void;
    discussionUsersUpdated(discussion: IPrivateDiscussion, users: IUser[], addedUsers: IUser[], removedUsers: IUser[]): void;
    newAnnouncement(announcement: IAnnouncement): void;
    newNotification(userId: string, notification: INotification): void;
    clearSessions(userId: string): void;
}

@Service()
export default class SocketService implements ISocketService {
    private server: Server;

    /**
     * Creates a new socket service.
     */
    constructor() {
        this.server = new Server(WebServer.server);

        this.server.on('connection', (socket: Socket) => {

            // auto-join global announcements
            socket.join('announcements');
            
            socket.on('join', args => {
                if (args && args.id) {
                    socket.join(args.id);
                }
            });
        });
    }

    /**
     * Notifies all members of a private discussion that a new message
     * has been sent.
     * @param discussionId The discussion id.
     * @param message The new message.
     */
    newPrivateMessage(discussionId: string, message: IMessage): void {
        this.server.to(discussionId).emit('newMessage', ApiMessage.createApiMessageFromDocument(message));
    }

    /**
     * Notifies all members of a private discussion that the users of the
     * discussion have been updated.
     * @param discussion The discussion
     * @param users The users within the discussion.
     * @param addedUsers The users added to the discussion.
     * @param removedUsers The users removed from the discussion.
     */
    discussionUsersUpdated(discussion: IPrivateDiscussion, users: IUser[], addedUsers: IUser[], removedUsers: IUser[]): void {
        
        // inform all the users of the conversation that the users have been updated
        const usersData = users.map(user => ({ 
            username: (user as IUser).username, 
            id: (user as IUser).id 
        }));
        this.server.to(discussion.id).emit('usersUpdated', usersData);

        // inform users who have just been added
        for (const user of addedUsers) {
            this.server.to(`privateDiscussions${user.id}`)
                .emit('newDiscussion', {
                    id: discussion.id,
                    host: { username: (discussion.host as IUser).username, id: (discussion.host as IUser).id },
                    users: (discussion.users as IUser[]).map(user => ({ username: user.username, id: user.id }))
                });
        }

        // inform users who have just been added
        for (const user of removedUsers) {
            this.server.to(`privateDiscussions${user.id}`)
                .emit('discussionRemoved', {
                    id: discussion.id
                });
        }
    }

    /**
     * Notifies all clients when a new announcement is published.
     * @param announcement The new announcement.
     */
    newAnnouncement(announcement: IAnnouncement): void {
        this.server.to('announcements').emit('newAnnouncement', ApiAnnouncement.createApiAnnouncementFromDocument(announcement))
    }

    /**
     * Sends a notification to a given user.
     * @param userId The ID of the user.
     * @param notification The notification to be sent.
     */
    newNotification(userId: string, notification: INotification): void {
        this.server.to(userId).emit('newNotification', ApiNotification.createApiNotificationFromDocument(notification));
    }

    /**
     * Clears all existing sessions for a given user.
     * @param userId The ID of the user.
     */
    clearSessions(userId: string): void {
        this.server.to(userId).emit('logout');
    }
}