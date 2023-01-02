import {faComment} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useState} from "react";
import {ReplyBox} from "@components/reply/Reply";
import "@components/codeHighlighter/codeRow.css";

/**
 * @property parsedCodeHtml the parsed html
 * @property lineNumber the line that represents the row
 * @property onCommentClicked the event that is fired when a comment is added
 * @property highlighted whether or not the row is highlight
 * @property showCommentInput the input box that appears when the row is being commented on
 */
interface CodeRowProps {
    parsedCodeHtml: string;
    lineNumber: number;
    onCommentClicked: (lineNumber: number) => void;
    highlighted: boolean;
    showCommentInput: boolean;
    onCommentAdded: (payload: string) => void;
}

export function CodeRow(props: CodeRowProps) {
    // Whether or not to show the comment icon
    const [showComment, setShowComment] = useState(false);

    const codeRowClasses = `code-row ${props.lineNumber % 2 === 0 ? 'grey-code-row' : ''}`;
    const lineNumberCellClasses = `code-line-number-cell ${props.highlighted ? 'code-highlighted-cell' : ''}`;
    const contentCellClasses = `code-content-cell ${props.highlighted ? 'code-highlighted-cell': ''}`;

    return (
        <>
            <tr onMouseEnter={() => setShowComment(true)} onMouseLeave={() => setShowComment(false)}
                className={codeRowClasses} >
                <td className={lineNumberCellClasses}>
                   <FontAwesomeIcon className="code-comment-icon" style={{visibility: showComment ? 'visible' : 'hidden',
                   cursor: 'pointer'}} icon={faComment} onClick={() => props.onCommentClicked(props.lineNumber)} />
                {props.lineNumber}
                </td>
                <td className={contentCellClasses} dangerouslySetInnerHTML={{__html: props.parsedCodeHtml}}/>
            </tr>
            { /* If we show the comment input box then add a reply box to the given line of code */ }
            { props.showCommentInput ?
                <tr style={{width: '100%'}}>
                    <td style={{width: '4rem'}} />
                    <td>
                        <ReplyBox  parentId={undefined}
                                   onReply={(_, payload) => props.onCommentAdded(payload)} />
                    </td>
                </tr> : null}
        </>
    );
}