import {Button, Container, Form, OverlayTrigger, Popover, Tooltip} from "react-bootstrap";
import {SubmissionService} from "@services/submission/submissionService";
import {Formik} from "formik";
import {ErrorFeedback} from "@components/forms/ErrorFeedback";
import {validateSubmission, validateVersionName} from "@root/validations/version/versionValidations";

/**
 * @param submissionId id of the submission we are adding a version of
 * @param onVersionAdded event that is fired when we add a version
 */
interface AddVersionFormProps {
    submissionId: string;
    onVersionAdded: () => void;
}

/**
 * @param version the id of the version
 * @param submission the submission representing the version
 */
interface VersionForm {
    version: string;
    submission: File | null;
}

/**
 * @param version the name of the version
 * @param submission the id of the submission
 */
interface VersionFormErrors {
    version: string;
    submission: string;
}

const validateVersionForm = (values: VersionForm) => {
    const errors = {} as VersionFormErrors;

    let versionError = validateVersionName(values.version);
    let submissionError = validateSubmission(values.submission);

    if (versionError)
        errors.version = versionError;

    if (submissionError)
        errors.submission = submissionError;

    return errors;
};

/**
 * Component for adding a version to the submission
 *
 * @param props
 * @constructor
 */
export default function AddVersionForm(props: AddVersionFormProps) {
    const submissionService = new SubmissionService();
    const formId = "newVersion";


    function handleSubmit() {
        const form = document.getElementById(formId) as HTMLFormElement;
        const formData = new FormData(form);

        submissionService.incrementVersion(formData, props.submissionId.trim()).then(res => {
            if (res.data && res.data.status === "success")
                props.onVersionAdded();
        });
    }

    return (
        <Container>
            <h4>New Version</h4>
            <h4 />

            <Formik
                initialValues={{
                    version: "",
                    submission: null
                }}
                validate={validateVersionForm}
                onSubmit={handleSubmit}>
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    errors,
                    setFieldValue
                }) => (
                    <Form id={formId} onSubmit={handleSubmit}>
                        <OverlayTrigger
                            placement='top'
                            overlay={<Popover>
                                <Popover.Header>
                                    Version
                                </Popover.Header>
                                <Popover.Body>
                                    The new version number.
                                </Popover.Body>
                            </Popover>}>
                            <Form.Group className="mb-3">
                                <Form.Control className="mt-2" type="input" name="version" placeholder="Version"
                                    onChange={e => setFieldValue("version", e.currentTarget.value)}/>
                                <ErrorFeedback name="version" />
                            </Form.Group>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>
                                Select a file for the new version of your submission.
                                This can be a single file or a zip file containing many other
                                files and directories.
                            </Tooltip>}>
                            <Form.Group className="mb-3">
                                <Form.Control className="mt-2" type="file" name="submission"
                                    onChange={e => setFieldValue("submission", e.currentTarget.value)}/>
                                <ErrorFeedback name="submission" />
                            </Form.Group>
                        </OverlayTrigger>

                        <Form.Group>
                            <Button variant="primary" type="submit">Add Version</Button>
                        </Form.Group>
                    </Form>
                )}
            </Formik>
        </Container>
    )
}