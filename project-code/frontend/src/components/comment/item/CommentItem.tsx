import {Button, Card, Col, Row} from "react-bootstrap";
import {OnCommentReply} from "@components/comment/CommentThread";
import {useState} from "react";
import {ReplyBox} from "@components/reply/Reply";
import {CommentThreadItem} from "@root/utilities/comment/commentTree";
import {Moment} from "moment";
import ProfileLink from "@components/profile/ProfileLink";
import "@components/comment/comments.css";
import {AddIcon} from "@components/icon/Icons";

/**
 * @property username the user name of the person who made the comment
 * @property userId the id of the user who made the comment
 * @property dateMade the date the comment was made
 * @property comment the comment that was made
 */
interface CommentRowProps {
    username: string;
    userId: string;
    dateMade?: Moment;
    comment: string;
}

/**
 * Represents a row of the details of the comment. Used within a card
 * to display the comment and the user
 * @param props arguments passed into the component
 */
export function CommentRow (props: CommentRowProps) {
    return <Row>
        <Col md="auto">
            <Card.Text>
                <ProfileLink username={props.username} userId={props.userId} />
                <span className="comment-date text-muted">{props.dateMade?.format("DD/MM/YYYY")}</span>
            </Card.Text>
        </Col>
        <Col md="auto">
            <Card.Text>
                <div dangerouslySetInnerHTML={{__html: props.comment}} />
            </Card.Text>
        </Col>
    </Row>
}

/**
 * @property comment the comment within the thread
 * @property onReply an event that is fired when someone replies to the comment
 * @property depth of the comment within the file
 */
interface CommentItemProp {
    comment: CommentThreadItem;
    onReply: OnCommentReply;
    depth: number;
}

/*
 * Only indent a maximum of five levels
 */
const MAX_INDENT = 5;

/**
 * Represents an individual comment. Consists of a card representing the comment
 *
 * @param comment the comment being made
 * @param onReply the event that is fired upon reply
 * @param depth the depth of the comment
 */
export function CommentItem({ comment, onReply, depth } : CommentItemProp) {
    // Only show child comments at a depth of a multiple 3
    const [showChildren, setShowChildren] = useState(depth === 0 || depth % 3 !== 0);
    const [showReplyBox, setShowReplyBox] = useState(false);

    // Whether to show the load more button. Only do so at a depth of a multiple of 3
    // and there are comments within the file
    const showLoadMore = depth % 3 === 0 && comment.replies.length !== 0 && !showChildren;

    /**
     * Event that is fired when a reply is made.
     * @param commentId the id of the comment which we are making a reply
     * @param payload the contents of the actual reply
     */
    const submitReply = (commentId: number | undefined, payload: string) => {
        onReply(commentId, payload);
        setShowReplyBox(false);
    };

    const repliesStyle = {
        borderLeft: comment.replies.length !== 0 && !showReplyBox && depth < MAX_INDENT ? '1px dashed #081C39': undefined,
    }

    const replyStyle = {
        marginLeft: depth < MAX_INDENT ? '1rem' : undefined,
        marginTop: '1rem'
    }

    const children = <div style={repliesStyle}>
        {comment.replies.map((reply, index) => {
            return <div style={replyStyle} key={index}>
                <CommentItem depth={depth + 1} comment={reply} onReply={onReply} />
            </div>
        })}
    </div>

    /**
     * The button to be displayed if there are more comments to show
     */
    const loadMoreButton = <div className="text-center">
        <Button variant="link" onClick={() => setShowChildren(true)}>
            <AddIcon /> Load More Comments
        </Button>
    </div>;

    return (
        <div className="mt-2">
            <Card>
                <Card.Body>
                    <CommentRow username={comment.commenter.username} userId={comment.commenter.userId} comment={comment.payload} />

                    { !showReplyBox ?
                        <Card.Link style={{cursor: "pointer"}} onClick={() => setShowReplyBox(true)}>
                            Reply
                        </Card.Link> : null }
                    {showReplyBox ? <ReplyBox onCancel={() => setShowReplyBox(false)} parentId={comment.commentId} onReply={submitReply} />: null}
                </Card.Body>
            </Card>
            {showLoadMore ? loadMoreButton : children}
        </div>
    );
}