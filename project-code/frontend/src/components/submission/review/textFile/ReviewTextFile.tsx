import {useParams} from "react-router-dom";
import {useState} from "react";
import CodeHighlighter from "@components/codeHighlighter/CodeHighlighter";
import * as path from "path";
import {Tab, Tabs} from "react-bootstrap";
import {Anchor, FileComments} from "@components/comment/file/FileComments";
import {AddComment} from "@components/comment/file/AddComment";
import {File} from "@responses/submission";
import {Comment} from "@responses/comment";

/**
 * @property submission the submission in review
 * @property review the id of the review
 * @property pathToFile the path to the file we are reviewing
 */
interface ReviewFileParam {
    submission: string;
    review: string;
    pathToFile: string;
}

enum ActiveTabs {
    CODE,
    COMMENTS,
    ADD_COMMENT
}

/**
 * @property addComment event that is fired when we add a comment
 * @property comments list of comments in the file
 * @property file file that is being commented on
 */
export interface ReviewTextFileProps {
    addComment: (anchor : Anchor | undefined, commentId: number | undefined, payload: string) => void;
    comments: Comment[];
    file: File;
}

/**
 * @param addComment event that is
 * @param file
 * @param comments
 * @constructor
 */
export default function ReviewTextFile({ addComment, file, comments }: ReviewTextFileProps) {
    const params = useParams<ReviewFileParam>();
    const [activeTab, setActiveTab] = useState(ActiveTabs.CODE);

    const onCommentAdded = (anchor: Anchor, payload: string) => {
        setActiveTab(ActiveTabs.COMMENTS);
        addComment(anchor, undefined, payload);
    }

    return (
        <div>
            <Tabs activeKey={activeTab} onSelect={(k: any) => setActiveTab(k)}>
                <Tab eventKey={ActiveTabs.CODE} title="Code">
                    {file ? <CodeHighlighter payload={file.content} extension={path.extname(params.pathToFile)} startLineNumber={1} /> : null}
                </Tab>
                <Tab eventKey={ActiveTabs.COMMENTS} title="Comments">
                    <FileComments comments={comments} fileContents={file?.content} pathToFile={decodeURIComponent(params.pathToFile)} reviewId={params.review}
                      onReply={addComment} />
                </Tab>
                <Tab eventKey={ActiveTabs.ADD_COMMENT} title="Add Comment">
                    <AddComment pathToFile={params.pathToFile} payload={file?.content}
                                onCommentAdded={onCommentAdded}/>
                </Tab>
            </Tabs>
        </div>
    );
}
