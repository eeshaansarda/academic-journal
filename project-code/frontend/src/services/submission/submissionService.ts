import {
    assignCoAuthorsEndpoint,
    assignReviewersEndpoint,
    deleteSubmissionEndpoint, deleteSupportingDocumentEndpoint,
    downloadEndpoint,
    fileEndpoint,
    getDentsEndpoint,
    getSubmissionsWithNoReviewers,
    incrementVersionEndpoint,
    mySubmissionsEndpoint, postCreateSubmissionFromGitHub,
    publishEndpoint,
    submissionEndpoint,
    submissionsEndpoint,
    supportingDocumentEndpoint,
    supportingDocumentsEndpoint,
    uploadSubmissionEndpoint,
    versionsEndpoint
} from "@root/config";
import axios, {AxiosInstance, AxiosResponse} from "axios";
import {GetFileResponse, SubmissionResponse, SupportingDocument} from "@responses/submission";
import {axiosInstance} from "@services/axiosInstance";

export interface ISubmissionService {
    uploadSubmission(form: FormData): Promise<AxiosResponse>;
    importFromGitHub(form: FormData): Promise<AxiosResponse>;
    getSubmissions(getSubmissions: GetSubmissionsQuery): Promise<AxiosResponse>;
    assignReviewers(submissionId: string, reviewers: string[]): Promise<AxiosResponse>;
    getSubmission(submissionId: string): Promise<AxiosResponse<SubmissionResponse>>;
    downloadSubmission(submissionId: string, version?: string): Promise<AxiosResponse>;
    getDents(submissionId: string, pathToFile: string, reviewId?: string): Promise<AxiosResponse>;
    getFile(submissionId: string, pathToFile: string): Promise<AxiosResponse>;
    publish(submissionId: string): Promise<AxiosResponse>;
    getVersions(submissionId: string): Promise<AxiosResponse>;
    incrementVersion(form: FormData, submission: string): Promise<AxiosResponse>;
    getSupportingDocuments(submissionId: string): Promise<AxiosResponse>;
    getSupportingDocument(submissionId: string, documentId: string): Promise<AxiosResponse>;
    addSupportingDocument(submissionId: string, formData: FormData): Promise<AxiosResponse>;
    deleteSubmission(submissionId: string): Promise<AxiosResponse>;
    assignCoAuthors(submissionId: string, authors: string[]): Promise<AxiosResponse>;
    getSubmissionsWithNoReviewers(pageNumber: number): Promise<AxiosResponse>;
    deleteSupportingDocument(submissionId: string, supportingDocumentId: string): Promise<AxiosResponse>;
}

interface GetSubmissionsQuery {
    pageNumber: number;
    title: string;
    sort: number;
    userId?: string;
}

export class SubmissionService implements ISubmissionService {
    public api: AxiosInstance = axiosInstance;

    uploadSubmission(form: FormData) {
        return this.api.post(uploadSubmissionEndpoint, form, {
            withCredentials: true
        });
    }

    importFromGitHub(form: FormData): Promise<AxiosResponse> {
        return this.api.post(postCreateSubmissionFromGitHub, form, { withCredentials: true });
    }

    incrementVersion(form: FormData, submission: string): Promise<AxiosResponse> {
        form.append("submissionId", submission);
        return this.api.put(incrementVersionEndpoint, form, {
            withCredentials: true
        });
    }

    getSubmissions(submissionsQuery: GetSubmissionsQuery) {
        return this.api.get(submissionsEndpoint, {
            params: {
                ...submissionsQuery
            },
            withCredentials: true
        });
    }


    getMySubmissions(pageNumber: number, title: string, sort: number) {
        return axios.get(mySubmissionsEndpoint, {
            params: {
                pageNumber,
                title,
                sort
            },
            withCredentials: true
        })
    }

    assignReviewers(submissionId: string, reviewers: string[]) {
        return this.api.put<{ status: string }>(assignReviewersEndpoint, {submissionId, reviewers}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    getSubmission(submissionId: string) {
        return axios.get<SubmissionResponse>(submissionEndpoint, {
            withCredentials: true,
            params: {
                submissionId
            }
        });
    }

    downloadSubmission(submissionId: string, version?: string): Promise<AxiosResponse> {
        return axios.get(downloadEndpoint, {
            params: {
                submissionId,
                version
            },
            responseType: "arraybuffer",
            withCredentials: true
        })
    }

    getDents(submissionId: string, pathToFile: string, reviewId?: string): Promise<AxiosResponse> {
        return axios.get(getDentsEndpoint, {
            params: {
                submissionId,
                pathToFile,
                reviewId
            },
            withCredentials: true
        });
    }

    getFile(submissionId: string, pathToFile: string): Promise<AxiosResponse> {
        return axios.get<GetFileResponse>(fileEndpoint, {
            params: {
                submissionId,
                pathToFile: decodeURIComponent(pathToFile)
            },
            withCredentials: true
        });
    }

    publish(submissionId: string): Promise<AxiosResponse> {
        return axios.put<{ status: string, reason?: string }>(publishEndpoint, { submissionId }, {
            withCredentials: true
        });
    }

    getVersions(submissionId: string): Promise<AxiosResponse> {
        return axios.get<{ status: string, versions: string[] }>(versionsEndpoint, {
            params: {
                submissionId
            },
            withCredentials: true
        });
    }

    getSupportingDocuments(submissionId: string) {
        return axios.get<{ status: string, documents: SupportingDocument[] }>(supportingDocumentsEndpoint, {
            params: {
                submissionId
            },
            withCredentials: true
        });
    }

    getSupportingDocument(submissionId: string, documentId: string): Promise<AxiosResponse> {
        return axios.get(supportingDocumentEndpoint, {
            params: {
                submissionId,
                supportingDocumentId: documentId
            },
            responseType: "arraybuffer",
            withCredentials: true
        });
    }

    addSupportingDocument(submissionId: string, formData: FormData): Promise<AxiosResponse> {
        formData.append("submissionId", submissionId);

        return axios.put(supportingDocumentEndpoint, formData, {
            withCredentials: true
        });
    }

    deleteSubmission(submissionId: string): Promise<AxiosResponse> {
        return axios.delete(deleteSubmissionEndpoint, {
            params: {
                submissionId
            },
            withCredentials: true
        });
    }

    assignCoAuthors(submissionId: string, authors: string[]): Promise<AxiosResponse> {
        return axios.put(assignCoAuthorsEndpoint, {submissionId, userIds: authors}, {withCredentials: true});
    }

    getSubmissionsWithNoReviewers(pageNumber: number): Promise<AxiosResponse> {
        return axios.get(getSubmissionsWithNoReviewers, {
            params: {
                pageNumber
            },
            withCredentials: true
        });
    }

    deleteSupportingDocument(submissionId: string, supportingDocumentId: string): Promise<AxiosResponse> {
        return axios.delete(deleteSupportingDocumentEndpoint, {
            params: {
                submissionId,
                supportingDocumentId
            },
            withCredentials: true
        });
    }
}
