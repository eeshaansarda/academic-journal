import {useHistory, useParams} from "react-router-dom";
import {Button, Col, Container, Row} from "react-bootstrap";
import {PrivateDiscussionService} from "@services/privateDiscussion/privateDiscussionService";
import {useContext, useEffect, useState} from "react";
import useStateRef from 'react-usestateref';
import {PrivateDiscussion} from "@responses/privateDiscussion";
import {Card} from "react-bootstrap";
import {CommentRow} from "@components/comment/item/CommentItem";
import SendPrivateDiscussion from "@components/privateDiscussion/send/SendPrivateDiscussion";
import ProfileLink from "@components/profile/ProfileLink";
import {MetadataIcon} from "@components/icon/Icons";
import PrivateDiscussionMetadata from "@components/privateDiscussion/metadata/PrivateDiscussionMetadata";
import { useSelector } from "react-redux";
import { selectUser } from "@slices/userSlice";
import { IUserIdentity } from "@responses/user";
import { privateDiscussionsPath } from "@config/paths";
import { SocketContext } from "@config/SocketContext";

/**
 * Represents the query parameters passed to each private discussion
 * page.
 */
interface PrivateDiscussionParams {
    privateDiscussionId: string;
}

/***
 * Represents the properties passed to a private discussion message 
 * component.
 */
interface PrivateDiscussionItemProps {
    username: string;
    userId: string;
    comment: string;
}

/**
 * Component for an individual message within the discussion.
 * @param props The message details.
 * @returns The message component.
 */
function PrivateDiscussionItem(props: PrivateDiscussionItemProps) {
    return <Card className="mt-2">
        <Card.Body>
            <CommentRow username={props.username} userId={props.userId} comment={props.comment} />
        </Card.Body>
    </Card>;
}

/**
 * The private discussion page component.
 * @returns The private discussion page component.
 */
export default function PrivateDiscussion() {
    const params = useParams<PrivateDiscussionParams>();
    const privateDiscussionService = new PrivateDiscussionService();
    const history = useHistory();
    const user = useSelector(selectUser);
    const socket = useContext(SocketContext);

    const [discussion, setDiscussion, discussionRef] = useStateRef<PrivateDiscussion | null>(null);
    const [showMetadata, setShowMetadata] = useState(false);

    /**
     * Loads the private discussion details via ID.
     */
    function getPrivateDiscussion() {
        privateDiscussionService.getPrivateDiscussion(params.privateDiscussionId).then(res => {
            if (res.data && res.data.status === "success") {
                setDiscussion(res.data.discussion);
            }
        });
    }

    /**
     * Sends a new message to the private discussion.
     * @param message The text contents of the message.
     */
    function onSendMessage (message: string) {
        privateDiscussionService.sendMessage(params.privateDiscussionId, message);
    }

    /**
     * Called on page load. Sets up event listeners on the socket for 
     * new messages and users added/removed from the private discussion.
     * Also loads in the initial private discussion details (messages etc).
     */
    useEffect(() => {
        // join the room with the given privateDiscussionId
        if (socket.connected) {
            socket.emit('join', {
                id: params.privateDiscussionId
            });
        } else {
            socket.on('connect', () => {
                socket.emit('join', {
                    id: params.privateDiscussionId
                });
            });
        }

        // on new message update the list of messages
        socket.on('newMessage', msg => {
            if (discussionRef.current) {
                setDiscussion({
                    ...discussionRef.current,
                    messages: [...discussionRef.current.messages, msg]
                });
            }
        });

        // on users updated add them to the private discussion page
        socket.on('usersUpdated', users => {
            // kick user out if they have been removed
            if (!users.find((u: IUserIdentity) => u.id == user!.id)) {
                history.push(privateDiscussionsPath);
            }

            if (discussionRef.current) {
                setDiscussion({
                    ...discussionRef.current,
                    users: users
                });
            }
        });
        getPrivateDiscussion();
    }, []);

    if (!discussion)
        return null;

    return (<Container>
        <Row>
            <Col>
                <h2>
                <div className="d-flex flex-wrap">
                    {discussion.users.map(user => <div style={{marginRight: '3px'}}><ProfileLink userId={user.id} /></div>)}
                </div></h2>
            </Col>
            <Col>
                <Button className="float-end" variant="light" onClick={setShowMetadata.bind(null, true)}>
                    <MetadataIcon />
                </Button>
            </Col>
        </Row>
        <hr />

        {discussion.messages.map(msg => <PrivateDiscussionItem username={msg.sender.username} userId={msg.sender.id} comment={msg.content} />)}

        <SendPrivateDiscussion onSend={onSendMessage} />

        <PrivateDiscussionMetadata show={showMetadata} onHide={setShowMetadata.bind(null, false)} discussionId={params.privateDiscussionId} />
    </Container>);
}