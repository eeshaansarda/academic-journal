import {useHistory, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Anchor} from "@components/comment/file/FileComments";
import {Comment} from "@responses/comment";
import {File} from "@responses/submission";
import {isImage, isJupyterNotebook, isMarkdown, isPdf} from "@root/utilities/mimeType";
import {CommentService} from "@services/commentService/commentService";
import {SubmissionService} from "@services/submission/submissionService";
import ReviewImage from '@components/submission/review/image/ReviewImage';
import ReviewMarkdown from '@components/submission/review/markdown/ReviewMarkdown';
import ReviewTextFile from '@components/submission/review/textFile/ReviewTextFile';
import ReviewPdf from "@components/submission/review/pdf/ReviewPdf";
import {resourceNotFound} from "@config/paths";
import ReviewJupyterDocument from "@components/submission/review/jupyter/ReviewJupyterDocument";

interface ReviewFileParam {
    submission: string;
    review: string;
    pathToFile: string;
}

export function ReviewFile() {
    const params = useParams<ReviewFileParam>();
    const [file, setFile] = useState<File | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const commentService = new CommentService();
    const submissionService = new SubmissionService();
    const history = useHistory();

    const getComments = () => commentService.getCommentsForFile(decodeURIComponent(params.pathToFile), params.review).then(response => {
        if (response.data && response.data.status === "success")
            setComments(response.data.comments);
    });

    const addComment = (anchor: Anchor | undefined, commentId: number | undefined, payload: string) => commentService.addCommentForReview({
        anchor,
        commentId,
        payload,
        review: params.review,
        pathToFile: decodeURIComponent(params.pathToFile)
    }).then(response => {
        if (response.data && response.data.status === "success")
            getComments();
    });

    useEffect(() => {
        submissionService.getFile(params.submission, params.pathToFile).then(response => {
            if (response.data.status === 'success')
                setFile(response.data.file);
        }).catch(_ => history.replace(resourceNotFound));
        getComments();
    }, [params.pathToFile, params.submission]);

    if (!file)
        return null;

    if (isImage(file.contentType))
        return <ReviewImage
            addComment={addComment.bind(null, undefined)}
            file={file}
            comments={comments} />

    if (isPdf(file.contentType))
        return <ReviewPdf addComment={addComment.bind(null, undefined)}
                          file={file} comments={comments} />

    if (isMarkdown(file.fileName))
        return <ReviewMarkdown addComment={addComment.bind(null, undefined)}
                               file={file}
                               comments={comments} />

    if (isJupyterNotebook(file.fileName))
        return <ReviewJupyterDocument 
                    addComment={addComment.bind(null, undefined)}
                    file={file}
                    comments={comments} />

    return <ReviewTextFile addComment={addComment} file={file} comments={comments} />
}