import {Button, Container, Form, Modal} from "react-bootstrap";
import {AddIcon, SupportingDocumentIcon} from "@components/icon/Icons";
import {useState} from "react";
import {SubmissionService} from "@services/submission/submissionService";

/**
 * @property submissionId the id of the submission to add a supporting document of
 * @property onDocumentAdded the event that is fired when we add a new document
 */
interface AddSupportingDocumentProps {
    submissionId: string;
    onDocumentAdded?: () => void;
}

/**
 * Component for adding a supporting document
 *
 * @param props
 * @constructor
 */
export default function AddSupportingDocument(props: AddSupportingDocumentProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [showError, setShowError] = useState(false);

    const showModal = () => setModalVisible(true);
    const hideModal = () => setModalVisible(false);

    const submissionService = new SubmissionService();

    const isFileSelected = () => {
        const form = document.getElementById("uploadForm") as HTMLFormElement;
        return form.supportingDocument.files.length;
    }


    function handleSubmit() {
        setShowError(false);

        if (!isFileSelected())
            setShowError(true);

        const form = document.getElementById("uploadForm") as HTMLFormElement;
        submissionService.addSupportingDocument(props.submissionId, new FormData(form)).then(() => {
            form.reset();
            hideModal();
            if (props.onDocumentAdded)
                props.onDocumentAdded();
        });
    }

    return <div className="m-1">
        <Button variant="warning" className="m-1" onClick={showModal}>
            <AddIcon /> <SupportingDocumentIcon />
        </Button>

        <Modal show={modalVisible} onHide={hideModal}>
            <Modal.Header closeButton>
                <Modal.Title>Manage Supporting Documents</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Form id="uploadForm" onSubmit={handleSubmit}>
                        <Form.Control
                            type="file"
                            name="supportingDocument"/>

                        <p
                            className="text-danger mt-2"
                            style={{ fontSize: 14, display: showError ? 'block': 'none' }}
                        >
                            Please select a file
                        </p>
                    </Form>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    Add Document
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}