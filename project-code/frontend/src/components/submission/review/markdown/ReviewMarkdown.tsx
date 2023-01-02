import {ViewMarkdown} from "@components/submission/view/markdown/ViewMarkdown";
import {CommentThread} from "@components/comment/CommentThread";
import {AddRootComment} from "@components/comment/addRootComment/AddRootComment";
import {convertCommentToTree} from "@root/utilities/comment/commentTree";
import { ReviewFileProps } from "@components/submission/review/reviewFileProps";

/**
 * @param addComment
 * @param file
 * @param comments
 */
export default function ReviewMarkdown({ addComment, file, comments }: ReviewFileProps) {
    const rootComments = convertCommentToTree(comments);

    return (
        <div>
            <ViewMarkdown file={file} />
            {rootComments.map((comment, index) => {
                return <CommentThread key={index} comments={comment} onReply={addComment} />
            })}
            <AddRootComment sendParentReply={addComment} />
        </div>
    );
}
