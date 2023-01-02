import {SubmissionService} from "@services/submission/submissionService";
import {SupportingDocument as SupportingDocumentButton} from "@components/submission/supportingDocument/SupportingDocuments";
import {Button, Col, Row} from "react-bootstrap";
import {DeleteIcon} from "@components/icon/Icons";

/**
 * @param fileName the name of the file that we are managing the supporting document of
 * @param documentId the id of the document that we are managing
 * @param submissionId the id of the submission corresponding to the supporting document
 * @param onDelete event that is fired when we delete the supporting document
 */
interface ManageSupportingDocumentProps {
    fileName: string;
    documentId: string;
    submissionId: string;
    onDelete: () => void;
}

/**
 *
 * @param fileName the fileName of the supporting document
 * @param documentId the id of the document we are managing
 * @param submissionId the id of the submission corresponding to the supporting documents
 * @param onDelete event that is fired when we delete a supporting document
 * @constructor
 */
export default function ManageSupportingDocumentRow({ fileName, documentId, submissionId, onDelete }: ManageSupportingDocumentProps) {
    const submissionService = new SubmissionService();

    function deleteSupportingDocument() {
        submissionService.deleteSupportingDocument(submissionId, documentId).then(res => {
            if (res.data && res.data.status === "success") {
                onDelete();
            }
        });
    }

    return (<Row>
        <Col>
            <Button variant="danger" onClick={deleteSupportingDocument}>
                <DeleteIcon />
            </Button>
            <SupportingDocumentButton fileName={fileName} documentId={documentId} submissionId={submissionId} />
        </Col>
    </Row>);
}