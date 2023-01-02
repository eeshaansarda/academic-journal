import {ViewPdf} from "@components/submission/view/pdf/ViewPdf";
import {CommentThread} from "@components/comment/CommentThread";
import {AddRootComment} from "@components/comment/addRootComment/AddRootComment";
import {convertCommentToTree} from "@root/utilities/comment/commentTree";
import { ReviewFileProps } from "@components/submission/review/reviewFileProps";

export default function ReviewPdf({ addComment, file, comments }: ReviewFileProps) {
    const rootComments = convertCommentToTree(comments);

    return (
        <div>
            <ViewPdf file={file} />
            {rootComments.map((comment, index) => {
                return <CommentThread key={index} comments={comment} onReply={addComment} />
            })}
            <AddRootComment sendParentReply={addComment} />
        </div>
    );
}