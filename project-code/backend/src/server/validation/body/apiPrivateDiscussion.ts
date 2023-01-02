import {IsArray, IsDefined} from "class-validator";
import {IMessage, IPrivateDiscussion} from "@models/message/privateDiscussionModel";
import {IUser} from "@models/user/userModel";

/**
 * Represents a message in a private discussion.
 */
export class ApiMessage {
    @IsDefined()
    sender: {  username: string, id: string  };

    @IsDefined()
    content: string;

    /**
     * Creates a message (to be returned from the API) from a stored message.
     * @param document The stored message.
     * @returns The message.
     */
    public static createApiMessageFromDocument(document: IMessage): ApiMessage {
        return {
            sender: { username: (document.sender as IUser).username, id: (document.sender as IUser).id },
            content: document.content
        };
    }
}

/**
 * Represents the body of a request to create a private message.
 */
export class ApiCreatePrivateMessage {
    @IsDefined()
    message: string;

    @IsDefined()
    privateDiscussionId: string;
}

/**
 * Represents a private discussion room.
 */
export class ApiPrivateDiscussion {
    @IsDefined()
    id: string;

    @IsDefined()
    messages: ApiMessage[];

    @IsDefined()
    host: { username: string; id: string }

    users: { username: string; id: string }[]

    /**
     * Creates a private dicussion (to be returned from the API) from a stored 
     * private discussion.
     * @param document The stored private discussion.
     * @returns The private discussion.
     */
    public static createApiPrivateDiscussionFromDocument(document: IPrivateDiscussion): ApiPrivateDiscussion {
        return {
            id: document.id,
            messages: document.messages.map(ApiMessage.createApiMessageFromDocument),
            host: { username: (document.host as IUser).username, id: (document.host as IUser).id },
            users: ApiPrivateDiscussion.createApiPrivateDiscussionUsers(document)
        };
    }

    /**
     * Creates an array of users in a private discussion (to be returned
     * from the API) from a stored private discussion.
     * @param document The stored private discussion.
     * @returns The array of users in the private discussion.
     */
    public static createApiPrivateDiscussionUsers(document: IPrivateDiscussion): { username: string, id: string }[] {
        return document.users.map(user => ({ username: (user as IUser).username, id: (user as IUser).id }))
    }
}

/**
 * Represents the body of a request to set the users of a private discussion.
 */
export class ApiPrivateDiscussionSetUsers {
    @IsDefined()
    discussionId: string;

    @IsDefined()
    @IsArray()
    users: string[];
}

