import {Container} from "react-bootstrap";
import CodeHighlighter from "@components/codeHighlighter/CodeHighlighter";
import {CommentThread, OnCommentReply} from "@components/comment/CommentThread";
import {Anchor} from "@components/comment/file/FileComments";
import {CommentThreadItem} from "@root/utilities/comment/commentTree";


/**
 * Get the code block being commented on
 *
 * @param anchor the set of lines being commented on
 * @param lines all the lines in the code
 */
function getCodeBlock(anchor: Anchor | undefined, lines: string) {
    const lineList = lines.split('\n');

    if (!anchor)
        return "";

    return lineList.slice(anchor.start - 1, anchor.end).join('\n');
}


/**
 * Arguments passed into the file comment thread
 *
 * @property payload the payload being commented on
 * @property anchor the area of the file being commented on
 * @property thread the thread of comments associated with the comment
 * @property fileExtension the extension of the file being commented on
 * @property onReply an event that is fired when we reply to a comment
 */
interface FileCommentThreadProps {
    payload: string;
    anchor: Anchor | undefined;
    thread: CommentThreadItem;
    fileExtension: string;
    onReply: OnCommentReply;
}

/**
 * Component for display a thread within a file
 * @param payload the payload the thread represents
 * @param thread the thread of comments
 * @param fileExtension the extension of the file being commented on
 * @param onReply the event that is fired upon reply
 * @param anchor the lines of code being commented on
 */
export function FileCommentThread({payload, thread, fileExtension, onReply, anchor }: FileCommentThreadProps) {
    return (
        <Container>
            <CodeHighlighter payload={getCodeBlock(anchor, payload)}
                             extension={fileExtension} startLineNumber={anchor?.start ?? 0} />
            <CommentThread comments={thread} onReply={onReply} />
        </Container>
    );
}