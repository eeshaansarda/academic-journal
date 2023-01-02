import {FileCommentThread} from "@components/comment/file/FileCommentThread";
import * as path from "path";
import {convertCommentToTree} from "@root/utilities/comment/commentTree";

/**
 * Represents an event for when we reply to a comment within a file
 */
type OnFileCommentReply = (anchor: Anchor | undefined, parent: number | undefined, payload: string) => void;

/**
 * Start and end line numbers being commented on
 */
export interface Anchor {
    start: number;
    end: number;
}

/**
 * Represents a set of comments on a given file.
 * Each root comment is associated with an anchor of code that
 * is being commented on
 */
interface FileCommentsProps {
    fileContents: string | undefined;
    pathToFile: string | undefined;
    reviewId: string;
    comments: any[];
    onReply: OnFileCommentReply
}

/**
 * Component for displaying all comments on a given file
 *
 * @param fileContents the contents of the file
 * @param pathToFile the path from root the file is located in
 * @param comments the list of comments to display
 * @param onReply event fired when a comment is replied
 */
export function FileComments({ fileContents, pathToFile, comments, onReply }: FileCommentsProps) {
    // Convert the comments to a tree structure which we can display
    const rootComments = convertCommentToTree(comments);

    if (!fileContents || !pathToFile)
        return null;

    // Each thread. A thread consists of an anchor of code along with a series
    // of associated comments
    const threadComponents = rootComments.map(comment => {
        const anchor = comment.anchor;
        return <FileCommentThread
                    key={comment.commentId}
                    payload={fileContents}
                    fileExtension={path.extname(pathToFile)}
                    anchor={anchor}
                    thread={comment}
                    onReply={onReply.bind(null, anchor)}/>
    });

    return (
        <div>
            {threadComponents.length === 0 ? <h5 className="text-center">There are no comments on this file!</h5> : threadComponents}
        </div>
    );
}