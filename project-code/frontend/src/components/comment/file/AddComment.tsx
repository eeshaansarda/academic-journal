import {Container} from "react-bootstrap";
import * as path from "path";
import React from "react";
import {CodeCommenter, OnFileCommentAdded} from "@components/codeHighlighter/CodeCommenter";


interface AddCommentProps {
    pathToFile: string;
    payload: string | undefined;
    onCommentAdded: OnFileCommentAdded
}

/**
 * Add a comment to a file. Contains a commenter for commenting on the given file
 *
 * @param pathToFile the file being commented on
 * @param payload the contents of the file being commented on
 * @param onCommentAdded the event that is fired when a new comment is added
 */
export function AddComment({pathToFile, payload, onCommentAdded}: AddCommentProps) {
    if (!payload)
        return null;

    return (
        <Container>
            <CodeCommenter payload={payload} extension={path.extname(pathToFile)} onCommentAdded={onCommentAdded} />
        </Container>
    )
}