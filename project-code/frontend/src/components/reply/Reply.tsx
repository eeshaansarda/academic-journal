import {OnCommentReply} from "@components/comment/CommentThread";
import {useState} from "react";
import {Button, Form} from "react-bootstrap";
import RichTextEditor from "@components/richTextEditor/RichTextEditor";
import {EditorState} from "draft-js";
import "@components/comment/comments.css";

/**
 * @property parentId the id of the parent we are replying to
 * @property onReply the event that is fired when we reply
 * @property onCancel event that is fired when we cancel the reply
 */
interface ReplyBoxProp {
    parentId: number | undefined;
    onReply: OnCommentReply;
    onCancel?: () => void;
}

/**
 * Text editor allowing the user to reply to a given comment
 * @param onReply event that is fired when we reply to a comment
 * @param parentId the parentId of the comment we are replying to
 * @param onCancel the event that is fired when we cancel the reply
 */
export function ReplyBox({onReply, parentId, onCancel} : ReplyBoxProp) {
    const [payload, setPayload] = useState("");
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const onTextChanged = (text: string) => setPayload(text);

    const submitReply = () => {
        if (editorState.getCurrentContent().hasText()) {
            onReply(parentId, payload);
            setPayload("");
            setEditorState(() => EditorState.createEmpty());
        }
    }

    return (
        <Form.Group>
            <RichTextEditor name="text-editor" editorState={editorState} onEditorStateChanged={setEditorState} onChange={onTextChanged}
                placeholder="Add Comment..." />
            <div className="mt-2 add-comment-buttons">
                {onCancel ? <Button variant="secondary" className="float-right" onClick={onCancel}>
                    Cancel
                </Button> : null }
                <Button variant="primary" className="ms-1 float-right" onClick={submitReply}>
                    Send
                </Button>
            </div>
        </Form.Group>
    );
}