import {useEffect, useState} from "react";
import {File} from "@responses/submission";
import {useHistory, useParams} from "react-router-dom";
import {isImage, isJupyterNotebook, isMarkdown, isPdf} from "@root/utilities/mimeType";
import {ViewImage} from "@components/submission/view/image/ViewImage";
import {ViewTextFile} from "@components/submission/view/textFile/ViewTextFile";
import {ViewMarkdown} from "@components/submission/view/markdown/ViewMarkdown";
import { SubmissionService } from '@services/submission/submissionService';
import { ViewPdf } from '@components/submission/view/pdf/ViewPdf';
import {resourceNotFound} from "@config/paths";
import ViewJupyterNotebook from "@components/submission/view/jupyter/ViewJupyterNotebook";

interface FileParam {
    submission: string;
    pathToFile: string;
}

export function ViewFile() {
    const params = useParams<FileParam>();
    const [file, setFile] = useState<File | null>(null);
    const submissionService = new SubmissionService();
    const history = useHistory();

    useEffect(() => {
        submissionService.getFile(params.submission, params.pathToFile).then(response => {
            if (response.data.status === "success")
                setFile(response.data.file);
        }).catch(_ => history.replace(resourceNotFound));
    }, [params.pathToFile, params.submission])

    if (!file)
        return null;

    if (isImage(file.contentType))
        return <ViewImage file={file} />

    if (isPdf(file.contentType))
        return <ViewPdf file={file} />

    if (isMarkdown(file.fileName))
        return <ViewMarkdown file={file} />

    if (isJupyterNotebook(file.fileName))
        return <ViewJupyterNotebook file={file} />

    return <ViewTextFile file={file} />
}