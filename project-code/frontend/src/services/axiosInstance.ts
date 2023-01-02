import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {setError} from "@slices/errorSlice";
import {EnhancedStore} from "@reduxjs/toolkit";

export const axiosInstance = axios.create();

function getErrorMessage(error: AxiosError) {
    const data = error.response?.data;

    let message = "";

    if (data?.reason) {
        message += `Reason: ${data?.reason}`;

        if (data?.errors && process.env.NODE_ENV === "development")
            message += `\nErrors: ${JSON.stringify(data?.errors, null, '\t')}`;

        return message;
    }

    return JSON.stringify(data, null, '\t');
}

export function setUpAxiosInstance(instance: AxiosInstance, store: EnhancedStore) {
    axiosInstance.interceptors.response.use((response: AxiosResponse) => response,
        (error: AxiosError) => {
            store.dispatch(setError({ message: getErrorMessage(error), status: error.response?.status }))
            return Promise.reject(error);
        });
}