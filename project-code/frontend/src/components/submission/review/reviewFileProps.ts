import {File} from "@responses/submission";
import {Comment} from "@responses/comment";

/**
 * @property addComment event that is fired when we add a comment
 * @property file the file that we are reviewing
 * @property comments the thread of comments in the review of the file
 */
export interface ReviewFileProps {
    addComment: (commentId: number | undefined, payload: string) => void;
    file: File;
    comments: Comment[];
}