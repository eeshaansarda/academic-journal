import {EditorState, convertToRaw} from "draft-js";
import {Editor} from "react-draft-wysiwyg";
import "draft-js/dist/Draft.css";
import draftToHtml from "draftjs-to-html";
import "draft-js/dist/Draft.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "@components/richTextEditor/richtexteditor.css";

/**
 * @property name the form field name of the text editor
 * @property onChange event that is fired when new input is added
 * @property initialValue the initial contents of the text editor
 * @property onEditorStateChanged event that is fired when the editor changes
 * @property placeholder initial text occupied by the rich text editor
 */
interface RichTextEditorProps {
    name: string;
    onChange?: (e : string) => any;
    initialValue?: string;
    editorState: EditorState;
    onEditorStateChanged: (state: EditorState) => any;
    placeholder?: string;
}

/**
 * Component for displaying and formatting rich text.
 *
 * @param props
 */
export default function RichTextEditor(props: RichTextEditorProps) {

    const getHtmlValue = () => draftToHtml(convertToRaw(props.editorState.getCurrentContent()));

    function onEditorChange() {
        const value = getHtmlValue();

        if (props.onChange)
            return props.onChange(value);
    }


    return (
        <div>
            <Editor editorState={props.editorState} onEditorStateChange={props.onEditorStateChanged} toolbarClassName="rich-text-header"
                    editorClassName="rich-text-body" onChange={onEditorChange} placeholder={props.placeholder} />
            <input type="hidden" name={props.name} value={getHtmlValue()} />
        </div>
    );
}