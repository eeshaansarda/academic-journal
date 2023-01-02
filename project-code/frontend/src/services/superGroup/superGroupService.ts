import {exportSubmissionEndpoint, superGroupMappingEndpoint} from "@root/config";
import axios, {AxiosInstance, AxiosResponse} from "axios";
import {axiosInstance} from "@services/axiosInstance";

export interface ISuperGroupService {
    getSuperGroupMappings(): Promise<AxiosResponse>;
    exportSubmission(url: string, id: string): Promise<AxiosResponse>;
}

export class SuperGroupService implements ISuperGroupService {
    public api: AxiosInstance = axiosInstance;

    getSuperGroupMappings() {
        return axios.get(superGroupMappingEndpoint, {
            withCredentials: true
        });
    }

    exportSubmission(url: string, id: string) {
        return axios.post(exportSubmissionEndpoint, {
            url,
            id
        }, {
            withCredentials: true
        });
    }
}