import {AxiosInstance, AxiosResponse} from "axios";
import {bansEndpoint, banUserEndpoint, revokeBanEndpoint} from "@root/config";
import {axiosInstance} from "@services/axiosInstance";

interface BanUserArgs {
    userId: string;
    reason: string;
    expiry: number;
}

export interface IBanService {
    revokeBan(banId: string): Promise<AxiosResponse>;
    getBans(pageNumber: number): Promise<AxiosResponse>;
    banUser(params: BanUserArgs): Promise<AxiosResponse>;
}

export class BanService implements IBanService {
    public api: AxiosInstance = axiosInstance;

    revokeBan(banId: string) {
        return this.api.post(revokeBanEndpoint, {
            id: banId,
        }, {
            withCredentials: true
        });
    }

    getBans(pageNumber: number) {
        return this.api.get(bansEndpoint, {
            params: {
                pageNumber: pageNumber
            },
            withCredentials: true
        });
    }

    banUser({ userId, reason, expiry }: BanUserArgs): Promise<AxiosResponse> {
        return this.api.post(banUserEndpoint, {
            id: userId,
            reason,
            expiry
        }, { withCredentials: true });
    }
}

