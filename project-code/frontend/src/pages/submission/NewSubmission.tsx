import { useState } from 'react';
import { Formik } from 'formik';
import {Container, Form, Button, OverlayTrigger, Popover, Tooltip, Row, Col} from 'react-bootstrap';
import { useHistory } from 'react-router';
import { submissionPath } from '@config/paths';
import RichTextEditor from "@components/richTextEditor/RichTextEditor";
import {EditorState} from "draft-js";
import {ISubmissionService, SubmissionService} from "@services/submission/submissionService";
import {GitHubIcon, SubmissionIcon} from "@components/icon/Icons";
import GitHubFields from "@components/submission/github/GitHubFields";
import {
    validateDescription,
    validateInitialVersion,
    validateTitle
} from "@root/validations/submission/submissionValidations";
import {ErrorFeedback} from "@components/forms/ErrorFeedback";

interface SubmissionForm {
    title: string;
    description: string;
    initialVersion: string;
    // The GitHub owner
    owner?: string;
    repoName?: string;
}

interface SubmissionFormErrors {
    title?: string;
    description: string;
    initialVersion: string;
    repoName?: string;
}

/**
 * Attempts to upload the submission.
 * @param form The form element.
 * @returns A promise that resolves with either the successful submission id
 * or void (failure).
 */
function uploadSubmission(form: HTMLFormElement): Promise<string | void> {
    const formData = new FormData(form);
    const submissionService: ISubmissionService = new SubmissionService();

    return new Promise(res => {
        submissionService.uploadSubmission(formData).then(response => {
            if (response.data.status && response.data.status === 'success') {
                res(response.data.submissionId);
            } else {
                res();
            }
        }).catch(_ => res());
    });
}

/**
 * Attempts to download a submission from github.
 *
 * @param form The form element.
 * @returns A promise that resolves with either the successful submission id
 * or void (failure).
 */
function importFromGitHub(form: HTMLFormElement): Promise<string | void> {
    const formData = new FormData(form);
    const submissionService = new SubmissionService();

    return new Promise(res => {
        submissionService.importFromGitHub(formData).then(response => {
            if (response.data.status && response.data.status === 'success') {
                res(response.data.submissionId);
            } else {
                res();
            }
        }).catch(_ => { res() });
    })
}

/**
 * Renders the new submission page.
 */
export default function NewSubmission() {
    const [ showFileError, setShowFileError ] = useState(false);
    const [ editorState, setEditorState ] = useState(() => EditorState.createEmpty());
    const [ importGithub, setImportGitHub ] = useState(false);

    const history = useHistory();
    const apiUpload = importGithub ? importFromGitHub  : uploadSubmission;

    /**
     * Validates that a file has been selected.
     */
    const isFileSelected = () => {
        const form = document.getElementById('uploadForm') as HTMLFormElement;
        return form.submission.files.length;
    }
    
    /**
     * Uploads the submission when the form is submitted.
    */
    const submissionFormSubmitted = async (importGitHub: boolean) => {
        const form = document.getElementById('uploadForm') as HTMLFormElement;
        
        // have to handle this ourselves as Formik doesn't support files
        if (!importGitHub && !isFileSelected()) {
            setShowFileError(true);
            return;
        }
        
        const submissionId = await apiUpload(form);
        if (submissionId) {
            const path = `${submissionPath}/${submissionId}`;
            history.replace({ pathname: path });
        }
    };

    /**
     * Checks the title and description are provided.
     * @param values The form values.
     * @returns The errors object
     */
    const validateForm = (values: SubmissionForm) => {
        const errors = {} as SubmissionFormErrors;

        let titleError = validateTitle(values.title);
        let descriptionError = validateDescription(values.description);
        let initialVersionError = validateInitialVersion(values.initialVersion);

        if (titleError)
            errors.title = titleError;

        if (descriptionError)
            errors.description = descriptionError;

        if (initialVersionError)
            errors.initialVersion = initialVersionError;

        return errors;
    };

    return (
        <Container>
            <Formik 
                initialValues={{
                    title: '',
                    description: '',
                    initialVersion: ''
                }}
                validate={validateForm}
                onSubmit={submissionFormSubmitted.bind(null, importGithub)}
            >
            {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
                setFieldValue
            }) => (
                <Form id="uploadForm" noValidate onSubmit={handleSubmit}>
                    <h2 className="mb-3 mt-3"><SubmissionIcon /> New Submission</h2>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>

                        <OverlayTrigger
                            placement='top'
                            overlay={<Popover>
                                <Popover.Header>
                                    Title
                                </Popover.Header>
                                <Popover.Body>
                                    The title of your submission. Make it stand out!
                                </Popover.Body>
                            </Popover>}>
                        <Form.Control
                            type="text"
                            placeholder="Title"
                            name="title"
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        </OverlayTrigger>

                        <ErrorFeedback name="title" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <RichTextEditor
                            name="description"
                            onChange={(val) => setFieldValue("description", val)}
                            editorState={editorState}
                            onEditorStateChanged={setEditorState}/>

                        <ErrorFeedback name="description" />
                    </Form.Group>

                    <Form.Group className="mb-3 mt-4">
                        {importGithub ?
                            <GitHubFields error={touched.repoName ? errors.repoName : ''}
                                          onReturn={setImportGitHub.bind(null, false)}
                                          onChange={(user, repo) => { setFieldValue('owner', user); setFieldValue('repoName', repo) }} />
                        : <>
                                <Row>
                                    <Col className="d-flex">
                                        <OverlayTrigger
                                            placement='top'
                                            overlay={<Tooltip>
                                                Select a file for your submission. This can be a single file or a zip file containing many other files and directories.
                                            </Tooltip>}>
                                            <Form.Control
                                                type="file"
                                                name="submission"
                                            />
                                        </OverlayTrigger>
                                        <Button variant="light" onClick={setImportGitHub.bind(null, true)}>
                                            <GitHubIcon />
                                        </Button>
                                    </Col>
                                </Row>
                                <p
                                    className="text-danger mt-2"
                                    style={{ fontSize: 14, display: showFileError ? 'block': 'none' }}>
                                    Please select a file
                                </p>
                            </>}

                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Initial Version</Form.Label>

                        <OverlayTrigger
                            placement='top'
                            overlay={<Popover>
                                <Popover.Header>
                                    Initial Version
                                </Popover.Header>
                                <Popover.Body>
                                    The version that your submission starts at. For example 1.0.0
                                </Popover.Body>
                            </Popover>}>
                        <Form.Control 
                            type="text"
                            placeholder="Initial Version"
                            name="initialVersion"
                            value={values.initialVersion}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        </OverlayTrigger>

                        <Form.Control.Feedback type="invalid" style={{ display: errors.initialVersion && touched.initialVersion ? 'block' : 'none' }}>
                            {errors.initialVersion}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className="mt-1" onClick={() => {
                        if (!importGithub && !isFileSelected()) {
                            setShowFileError(true);
                        }

                        handleSubmit();
                    }}>Upload</Button>
                </Form>
            )}
            </Formik>
        </Container>
    );
}