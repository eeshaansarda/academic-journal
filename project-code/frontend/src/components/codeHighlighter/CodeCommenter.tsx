import {CodeRow} from "@components/codeHighlighter/CodeRow";
import Prism from "prismjs";
import {useState} from "react";
import {inRange} from "lodash";
import {Anchor} from "@components/comment/file/FileComments";
import "prismjs/themes/prism-coy.css";
import "prismjs/components/prism-java";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markdown";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import {languageMap} from "@components/codeHighlighter/CodeHighlighter";

/**
 * React-Script that contains a component used for commenting on code
 */

/**
 * Type for when a file has been commented
 */
export type OnFileCommentAdded = (anchor: Anchor, payload: string) => void;

/**
 * Interface representing the code commenter
 *
 * @property payload the contents of the file that are being commented on
 * @property extension the extension of the file
 * @property onCommentAdded the event that is fired when a file has been
 * commented on
 */
interface CodeCommenterProps {
    payload: string;
    extension: string | null;
    onCommentAdded: OnFileCommentAdded;
}

/**
 * Component used for commenting on lines of code
 *
 * @param props argument to pass into the component
 */
export function CodeCommenter(props: CodeCommenterProps) {
    // get the language of the code being commented on
    const language = languageMap.get(props.extension);

    // Highlight the code and style accordingly
    const highlight = Prism.highlight(props.payload.trimEnd(), Prism.languages[language ?? "plaintext"],
        language ?? 'plaintext');

    // Split the file up into its constituent lines
    const lines = highlight.split("\n");

    // The anchor being commented on
    const [anchor, setAnchor] = useState({start: -1, end: -1});

    // Whether or not highlighting is taking place
    const [isHighlight, setIsHighlight] = useState(false);

    // When a comment is clicked if a highlight isn't taking place only
    // highlight one line of code
    function onCommentClicked(lineNumber: number) {
        if (!isHighlight) {
            setAnchor({start: lineNumber, end: lineNumber});
        } else {
            // Otherwise highlight the start and end lines
            const start = Math.min(anchor.start, lineNumber);
            const end = Math.max(anchor.end, lineNumber);

            setAnchor({start, end});
        }
        setIsHighlight(!isHighlight);
    }

    /**
     * Handle when a comment is added. Reset the anchor
     * and set highlight to false
     *
     * @param payload the contents that was added
     */
    function onCommentAdded(payload: string) {
        setAnchor({start: -1, end: -1});
        setIsHighlight(false);
        props.onCommentAdded(anchor, payload);
    }

    return (<pre>
            <table style={{width: '100%', backgroundColor: 'white'}}>
                <tbody>
                {lines.map((row, index) => <CodeRow onCommentAdded={onCommentAdded}
                                                    showCommentInput={index + 1 === anchor.end}
                                                    onCommentClicked={onCommentClicked}
                                                    highlighted={inRange(index + 1, anchor.start, anchor.end + 1)}
                                                    key={index}
                                                    parsedCodeHtml={row}
                                                    lineNumber={index + 1}/>)}
                </tbody>
            </table>
        </pre>
    );
}