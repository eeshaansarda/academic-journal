import axios, {AxiosResponse} from "axios";
import {
    postPrivateMessageEndpoint,
    privateDiscussionEndpoint,
    privateDiscussionsEndpoint,
    privateDiscussionUsersEndpoint
} from "@root/config";

interface IPrivateDiscussionService {
    getPrivateDiscussion: (discussionId: string) => Promise<AxiosResponse>;
    sendMessage: (discussionId: string, message: string) => Promise<AxiosResponse>;
    getUsers: (discussionId: string) => Promise<AxiosResponse>;
    setUsers: (discussionId: string, users: string[]) => Promise<AxiosResponse>;
    getPrivateDiscussions: (pageNumber: number) => Promise<AxiosResponse>;
    createPrivateDiscussion: () => Promise<AxiosResponse>;
}

export class PrivateDiscussionService implements IPrivateDiscussionService {
    getPrivateDiscussion(discussionId: string): Promise<AxiosResponse> {
        return axios.get(privateDiscussionEndpoint, {
            params: {
                discussionId
            },
            withCredentials: true
        });
    }

    sendMessage(discussionId: string, message: string) {
        return axios.post(postPrivateMessageEndpoint, { message, privateDiscussionId: discussionId }, { withCredentials: true });
    }

    getUsers(discussionId: string): Promise<AxiosResponse> {
        return axios.get(privateDiscussionUsersEndpoint, {
            params: {
                discussionId
            },
            withCredentials: true
        });
    }

    setUsers(discussionId: string, users: string[]): Promise<AxiosResponse> {
        return axios.put(privateDiscussionUsersEndpoint, { discussionId, users }, { withCredentials: true });
    }

    getPrivateDiscussions(pageNumber: number): Promise<AxiosResponse> {
        return axios.get(privateDiscussionsEndpoint, {
            params: {
                pageNumber
            },
            withCredentials: true
        });
    }

    createPrivateDiscussion(): Promise<AxiosResponse> {
        return axios.post(privateDiscussionEndpoint, {}, { withCredentials: true });
    }
}

