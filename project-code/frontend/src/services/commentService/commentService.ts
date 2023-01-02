import {AxiosInstance, AxiosResponse} from "axios";
import {commentEndpoint, commentFileEndpoint} from "@root/config";
import {Anchor} from "@components/comment/file/FileComments";
import {axiosInstance} from "@services/axiosInstance";

interface CommentResponse {
    status: string;
    comments: any;
}

export interface AddCommentForReview {
    anchor: Anchor | undefined;
    commentId: number | undefined;
    payload: string;
    pathToFile: string;
    review: string;
}


export interface ICommentService {
    getComments(reviewId: string): Promise<AxiosResponse<CommentResponse>>;
    sendComment(reviewId: string, parentId: number | undefined, payload: string): Promise<AxiosResponse<{ status: string }>>;
    getCommentsForFile(pathToFile: string, reviewId: string): Promise<AxiosResponse<CommentResponse>>;
    addCommentForReview(commentForReview: AddCommentForReview): Promise<AxiosResponse<{status: string}>>;
}

export class CommentService implements ICommentService {
    public api: AxiosInstance = axiosInstance;

    getComments(reviewId: string): Promise<AxiosResponse<CommentResponse>> {
        return this.api.get<CommentResponse>(commentEndpoint, {
            params: {
                reviewId
            },
            withCredentials: true
        });
    }

    sendComment(reviewId: string, parentId: number | undefined, payload: string): Promise<AxiosResponse<{ status: string }>> {
        return this.api.post<{ status: string }>(commentEndpoint, { reviewId, parentId, payload },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
        });
    }

    getCommentsForFile(pathToFile: string, reviewId: string) {
        return this.api.get<CommentResponse>(commentFileEndpoint, {
            params: {
                pathToFile,
                reviewId
            },
            withCredentials: true
        });
    }

    addCommentForReview({pathToFile, review, anchor, commentId, payload}: AddCommentForReview) {
        return this.api.post(commentFileEndpoint, {
            pathToFile,
            reviewId: review,
            anchor,
            parentId: commentId,
            payload
        }, { withCredentials: true });
    }

}