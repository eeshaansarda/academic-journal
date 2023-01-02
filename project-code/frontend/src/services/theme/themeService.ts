import axios, {AxiosResponse} from "axios";
import {themeEndpoint} from "@root/config";

interface IThemeService {
    getTheme: () => Promise<AxiosResponse>;
    setTheme: (theme: string) => Promise<AxiosResponse>;
}

export default class ThemeService implements IThemeService {
    getTheme(): Promise<AxiosResponse> {
        return axios.get(themeEndpoint, { withCredentials: true });
    }

    setTheme(theme: string): Promise<AxiosResponse> {
        // Use local storage to cache the theme, this prevents the site showing a blank screen for a short period
        // of time
        localStorage.setItem("theme", theme);
        return axios.put(themeEndpoint, { theme }, { withCredentials: true });
    }
}