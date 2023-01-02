import {Container} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {CommentThread} from "@components/comment/CommentThread";
import {AddRootComment} from "@components/comment/addRootComment/AddRootComment";
import {CommentService} from "@services/commentService/commentService";
import {CommentThreadItem, convertCommentToTree} from "@root/utilities/comment/commentTree";

/**
 * @property id of the review where the comment is taking place
 */
interface CommentProps {
    reviewId: string;
}

/**
 * Component representing a set of comments within a review. This consists of the root level
 * comments
 * @param reviewId the id of the review being commented on
 */
export default function Comments({ reviewId } : CommentProps) {
    const [responses, setResponse] = useState<CommentThreadItem[]>([]);
    const commentService = new CommentService();

    const sendReply = (commentId: number | undefined, payload: string) => {
        commentService.sendComment(reviewId, commentId, payload).then(response => {
            if (response.data && response.data.status === 'success') {
                getComments(reviewId);
            }
        })
    }

    useEffect(() => {
        getComments(reviewId);
    }, [reviewId]);

    function getComments(reviewId: string) {
        commentService.getComments(reviewId).then(response => {
            if (response.data && response.data.status === 'success') {
                const rootComments = convertCommentToTree(response.data.comments);
                setResponse(rootComments);
            }
        });
    }

    return (
        <Container>
            <AddRootComment sendParentReply={sendReply} />
            {responses.map((comments, index) => {
                return <CommentThread key={index} comments={comments} onReply={sendReply}/>
            })}
        </Container>
    );
}