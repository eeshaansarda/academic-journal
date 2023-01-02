import React from "react";
import {ReplyBox} from "@components/reply/Reply";
import {OnCommentReply} from "@components/comment/CommentThread";

interface AddRootCommentProps {
    sendParentReply: OnCommentReply;
}

/**
 * Component for adding a root comment to a file.
 *
 * @param sendParentReply event that is fired when we reply. The parent can be null representing a reply
 * to the content itself (root comment)
 */
export function AddRootComment({ sendParentReply }: AddRootCommentProps) {
    const sendRootReply = (commentId: number | undefined, payload: string) => {
        sendParentReply(commentId, payload);
    }

    return (
        <div>
            <ReplyBox parentId={undefined} onReply={sendRootReply} />
        </div>
    );
}