import {useEffect, useState} from "react";
import {Submission, SupportingDocument} from "@responses/submission";
import {SubmissionService} from "@services/submission/submissionService";
import {Button} from "react-bootstrap";
import {SupportingDocumentIcon} from "@components/icon/Icons";
import fileDownload from "js-file-download";

/**
 * @param fileName name of the supporting document
 * @parma documentId the id of the supporting document
 * @param submissionId the id of the submission
 */
interface SupportingDocumentProps {
    fileName: string;
    documentId: string;
    submissionId: string;
}

/**
 * Component for representing a supporting document
 * @param props
 * @constructor
 */
export function SupportingDocument(props: SupportingDocumentProps) {
    const submissionService = new SubmissionService();

    function downloadSupportingDocument() {
        submissionService.getSupportingDocument(props.submissionId, props.documentId).then(r => {
            const fileNameRegex = /filename=(?<filename>.+)$/;
            const match = fileNameRegex.exec(r.headers['content-disposition']);

            if (!match?.groups?.filename)
                throw new Error("content disposition was not specified");

            fileDownload(r.data, match.groups.filename);
        });
    }


    return <>
        <Button variant="primary" className="m-1" onClick={downloadSupportingDocument}>
            <SupportingDocumentIcon /> {props.fileName}
        </Button>
    </>;
}

interface SupportingDocumentsProps {
    submission: Submission;
    isPublication: boolean;
}

export default function SupportingDocuments(props: SupportingDocumentsProps) {
    const [supportingDocuments, setSupportingDocuments] = useState<SupportingDocument[]>([]);
    const submissionService = new SubmissionService();

    function getSupportingDocuments() {
        submissionService.getSupportingDocuments(props.submission.submissionId).then(res => {
           if (res.data && res.data.status === "success") {
               setSupportingDocuments(res.data.documents);
           }
        });
    }

    useEffect(() => {
        getSupportingDocuments();
    }, [props.submission])

    return (<div className="d-flex flex-wrap">
        {supportingDocuments.map(doc => <SupportingDocument key={doc.id} fileName={doc.fileName} documentId={doc.id} submissionId={props.submission.submissionId} />)}
    </div>);
}

