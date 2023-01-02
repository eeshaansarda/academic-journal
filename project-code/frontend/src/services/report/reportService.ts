import axios, {AxiosInstance, AxiosResponse} from "axios";
import {banReportEndpoint, dismissReportEndpoint, reportsEndpoint, reportUserEndpoint} from "@root/config";
import {axiosInstance} from "@services/axiosInstance";

export interface IReportService {
    banReport(reportId: string, reason: string, expiry: number): Promise<AxiosResponse>;
    dismissReport(id: string): Promise<AxiosResponse>;
    reportUser(userId: string, reason: string): Promise<AxiosResponse>;
    getReports(pageNumber: number): Promise<AxiosResponse>;
}

export class ReportService implements IReportService {
    public api: AxiosInstance = axiosInstance;

    banReport(reportId: string, reason: string, expiry: number) {
        return this.api.post(banReportEndpoint, {
            reportId,
            reason,
            expiry
        }, {
            withCredentials: true
        });
    }

    dismissReport(reportId: string) {
        return this.api.post(dismissReportEndpoint, {
            id: reportId
        }, {
            withCredentials: true
        });
    }

    reportUser(userId: string, reason: string): Promise<AxiosResponse> {
        return this.api.post(reportUserEndpoint, {
            id: userId,
            reason
        }, {
            withCredentials: true
        });
    }

    getReports(pageNumber: number): Promise<AxiosResponse> {
        return axios.get(reportsEndpoint, {
            params: {
                pageNumber: pageNumber
            },
            withCredentials: true
        });
    }
}