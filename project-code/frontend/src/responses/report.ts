import {IUserIdentity} from "@responses/user";

export interface Report {
    id: string;
    reason: string;
    subject: IUserIdentity;
    reporter: IUserIdentity;
}