import {AxiosInstance, AxiosResponse} from "axios";
import {myReviewsEndpoint, reviewEndpoint, reviewsEndpoint} from "@root/config";
import {axiosInstance} from "@services/axiosInstance";

interface PostReviewResponse {
    status: string;
    reviewId: string;
}


export interface IReviewService {
    addReview(submissionId: string): Promise<AxiosResponse<PostReviewResponse>>;
    getReviews(submissionId: string): Promise<AxiosResponse>;
    getReview(reviewId: string): Promise<AxiosResponse>;
    getMyReviews(pageNumber: number): Promise<AxiosResponse>;
}

export class ReviewService implements IReviewService {
    public api: AxiosInstance = axiosInstance;

    addReview(submissionId: string): Promise<AxiosResponse<PostReviewResponse>> {
        return this.api.post<PostReviewResponse>(reviewEndpoint, {
            submissionId
        }, { withCredentials: true });
    }

    getReviews(submissionId: string): Promise<AxiosResponse> {
        return this.api.get(reviewsEndpoint, {
            withCredentials: true,
            params: {
                submissionId
            }
        });
    }

    getReview(reviewId: string): Promise<AxiosResponse> {
        return this.api.get(reviewEndpoint, {
            withCredentials: true,
            params: {
                reviewId
            }
        });
    }

    getMyReviews(pageNumber: number): Promise<AxiosResponse> {
        return this.api.get(myReviewsEndpoint, {
            withCredentials: true,
            params: {
                pageNumber,
                sort: -1
            }
        })
    }
}