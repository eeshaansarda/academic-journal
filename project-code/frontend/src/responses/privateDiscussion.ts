import {IUserIdentity} from "@responses/user";

export interface Message {
    content: string;
    sender: { username: string; id: string; }
}

export interface PrivateDiscussion {
    id: string;
    messages: Message[];
    host: IUserIdentity
    users: IUserIdentity[]
}

export interface PrivateDiscussions {
    id: string;
    host: IUserIdentity;
    users: IUserIdentity[];
}