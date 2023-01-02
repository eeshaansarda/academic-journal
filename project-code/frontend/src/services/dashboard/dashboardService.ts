import axios, {AxiosResponse} from "axios";
import {dashboardEndpoint} from "@root/config";

export interface IDashboardService {
    getDashboard: (userId: string) => Promise<AxiosResponse>;
    setDashboard: (userId: string, dashboard: string) => Promise<AxiosResponse>;
}

export class DashboardService implements IDashboardService{
    getDashboard(): Promise<AxiosResponse> {
        return axios.get(dashboardEndpoint, {
            withCredentials: true
        });
    }

    setDashboard(dashboard: string): Promise<AxiosResponse> {
        return axios.put(dashboardEndpoint, {
            dashboard
        },{
            withCredentials: true
        });
    }
}