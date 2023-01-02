import {CommentItem} from "@components/comment/item/CommentItem";
import {CommentThreadItem} from "@root/utilities/comment/commentTree";

/*
 * Type for the event that represents someone replying to a comment.
 */
export type OnCommentReply = (commentId: number | undefined, payload: string) => void;

/**
 * @property comments list of comments within the thread
 * @property onReply the event that is fired when someone replies to the comment
 */
interface CommentThreadProps {
    comments: CommentThreadItem;
    onReply: OnCommentReply;
}

export function CommentThread({ comments, onReply } : CommentThreadProps) {
    return (<CommentItem depth={0} comment={comments} onReply={onReply} />)
}