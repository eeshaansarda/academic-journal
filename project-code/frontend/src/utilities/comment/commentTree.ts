interface Commenter {
    userId: string;
    username: string;
}


/**
 * @property commenter the user who commented on the thread
 * @property payload the payload of the given thread
 * @property commentMade the date the comment was made
 * @property commentId the id of the comment
 * @property replies the list of replies the comment has
 * @property anchor the start and end lines of code which have been commented on
 */
export interface CommentThreadItem {
    commenter: Commenter;
    payload: string;
    commentMade: Date;
    commentId: number | undefined;
    replies: CommentThreadItem[];
    anchor?: { start: number; end: number; }
}

/**
 * Converts a list of comments into a tree structure used to render a thread
 *
 * @param comments a list trees showing threads of comments
 */
export function convertCommentToTree(comments: any[]): CommentThreadItem[] {
    const commentMap = new Map<number, CommentThreadItem>();
    comments.sort((c1, c2) => c1.commentMade.valueOf() - c2.commentMade.valueOf());

    const rootComments: CommentThreadItem[] = [];

    for (let comment of comments) {
        const commentThread = {
            commenter: comment.commenter,
            payload: comment.payload,
            commentMade: comment.commentMade,
            commentId: comment.commentId,
            replies: [],
            anchor: comment.anchor
        };
        commentMap.set(comment.commentId, commentThread);

        if (comment.parentId !== undefined) {
            const parentComment = commentMap.get(comment.parentId);

            if (parentComment)
                parentComment.replies.push(commentThread);
        } else {
            rootComments.push(commentThread);
        }

    }
    return rootComments;
}