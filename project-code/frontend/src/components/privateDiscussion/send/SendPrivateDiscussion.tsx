import RichTextEditor from "@components/richTextEditor/RichTextEditor";
import {useState} from "react";
import {EditorState} from "draft-js";
import {Button, Form} from "react-bootstrap";

/**
 * Represents the properties passed to the send message component.
 * @property onSend event that is triggered when we send to the private discussion
 */
interface SendPrivateDiscussionProps {
    onSend: (message: string) => void;
}

/**
 * Component to send a message in a private discussion.
 * @param onSend Event that is fired when we send a message
 * @returns The component.
 */
export default function SendPrivateDiscussion ({ onSend }: SendPrivateDiscussionProps) {
    const [payload, setPayload] = useState("");
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const onTextChanged = (text: string) => setPayload(text);

    /**
     * Sends a new message.
     */
    const submitMessage = () => {
        if (editorState.getCurrentContent().hasText()) {
            onSend(payload);
            setPayload("");
            setEditorState(() => EditorState.createEmpty());
        }
    };

    return (
        <>
            <Form.Group>
                <RichTextEditor name="add-message" editorState={editorState} onEditorStateChanged={setEditorState} onChange={onTextChanged} />
                <Button variant="primary" className="ms-1 float-right" onClick={submitMessage}>
                    Send
                </Button>
            </Form.Group>
        </>
    );
}