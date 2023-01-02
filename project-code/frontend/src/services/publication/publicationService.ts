import {AxiosInstance, AxiosResponse} from "axios";
import {axiosInstance} from "@services/axiosInstance";
import {
    downloadPublishedSubmissionEndpoint,
    getFeaturedSubmissions, getPublicationEndpoint, myPublicationsEndpoint,
    publicationsEndpoint,
    submissionOfTheDayEndpoint
} from "@root/config";

export interface IPublicationService {
    getSubmissionOfTheDay(): Promise<AxiosResponse>;
    getFeaturedPublications(): Promise<AxiosResponse>;
    downloadPublication(publicationId: string): Promise<AxiosResponse>;
    getPublication(publicationId: string): Promise<AxiosResponse>;
    getMyPublications(pageNumber: number): Promise<AxiosResponse>;
}

interface GetPublishedSubmissionsQuery {
    pageNumber: number;
    title: string;
    sort: number;
    userId?: string;
}

export class PublicationService implements IPublicationService {
    public api: AxiosInstance = axiosInstance;

    downloadPublication(publicationId: string): Promise<AxiosResponse> {
        return this.api.get(downloadPublishedSubmissionEndpoint(publicationId), {
            responseType: "arraybuffer",
            withCredentials: true
        });
    }

    getFeaturedPublications(): Promise<AxiosResponse> {
        return this.api.get(getFeaturedSubmissions, {
            withCredentials: true
        });
    }

    getSubmissionOfTheDay(): Promise<AxiosResponse> {
        return this.api.get(submissionOfTheDayEndpoint, {
            withCredentials: true
        });
    }

    getPublishedSubmissions(query: GetPublishedSubmissionsQuery): Promise<AxiosResponse> {
        return this.api.get(publicationsEndpoint, {
            params: {
              ...query
            },
            withCredentials: true
        })
    }

    getPublication(publicationId: string): Promise<AxiosResponse> {
        return this.api.get(getPublicationEndpoint(publicationId), {
            withCredentials: true
        });
    }

    getMyPublications(pageNumber: number): Promise<AxiosResponse> {
        return this.api.get(myPublicationsEndpoint, {
            params: {
                pageNumber,
                title: "",
                sort: 1
            },
            withCredentials: true
        });
    }

}