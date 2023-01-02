import {useParams} from "react-router-dom";
import {SupportingDocumentIcon} from "@components/icon/Icons";
import {Col, Container, Row} from "react-bootstrap";
import {SubmissionService} from "@services/submission/submissionService";
import {useEffect, useState} from "react";
import {Submission, SupportingDocument} from "@responses/submission";
import ManageSupportingDocumentRow from "@components/submission/supportingDocument/ManageSupportingDocumentRow";
import AddSupportingDocument from "@components/submission/supportingDocument/AddSupportingDocument";
import NoSupportingDocuments from "@components/submission/supportingDocument/NoSupportingDocuments";

interface SupportingDocumentParams {
    submission: string;
}

export default function ViewSupportingDocuments() {
    const params = useParams<SupportingDocumentParams>();
    const submissionService = new SubmissionService();

    const [supportingDocuments, setSupportingDocuments] = useState<SupportingDocument[]>([]);
    const [submission, setSubmission] = useState<Submission | null>(null);

    function getSubmission() {
        submissionService.getSubmission(params.submission).then(res => {
            if (res.data && res.data.status === "success") {
                setSubmission(res.data.submission);
            }
        });
    }

    function getSupportingDocuments() {
        submissionService.getSupportingDocuments(params.submission).then(res => {
            if (res.data && res.data.status === "success") {
                setSupportingDocuments(res.data.documents);
            }
        });
    }

    useEffect(() => {
        getSubmission();
        getSupportingDocuments();
    }, [params.submission]);

    if (!submission)
        return null;

    const supportingDocRows = supportingDocuments.map(doc => <ManageSupportingDocumentRow
        onDelete={getSupportingDocuments}
        key={doc.id}
        submissionId={params.submission}
        fileName={doc.fileName}
        documentId={doc.id} />);

    return (
        <Container>
            <Row>
                <Col>
                    <h2><SupportingDocumentIcon /> Supporting Documents</h2>
                </Col>
                <Col>
                    <div className="float-end">
                        <AddSupportingDocument submissionId={params.submission} onDocumentAdded={getSupportingDocuments} />
                    </div>
                </Col>
            </Row>
            <hr />

            {supportingDocRows.length === 0 ? <NoSupportingDocuments /> : <Row>
                <Col className="d-flex justify-content-center">
                    <div>
                        {supportingDocRows}
                    </div>
                </Col>
            </Row>}
        </Container>
    );
}