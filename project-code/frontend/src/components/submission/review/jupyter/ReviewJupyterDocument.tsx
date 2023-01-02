import { AddRootComment } from "@components/comment/addRootComment/AddRootComment";
import { CommentThread } from "@components/comment/CommentThread";
import { ReviewFileProps } from "@components/submission/review/reviewFileProps";
import ViewJupyterNotebook from "@components/submission/view/jupyter/ViewJupyterNotebook";
import { convertCommentToTree } from "@root/utilities/comment/commentTree";

/**
 * Component for reviewing a Jupyter document.
 * @param props The properties passed to the component.
 * @returns The component.
 */
export default function ReviewJupyterDocument({ addComment, file, comments }: ReviewFileProps) {
    const rootComments = convertCommentToTree(comments);

    return (
        <div>
            <ViewJupyterNotebook file={file} />
            {rootComments.map((comment, index) => {
                return <CommentThread key={index} comments={comment} onReply={addComment} />
            })}
            <AddRootComment sendParentReply={addComment} />
        </div>
    );
}