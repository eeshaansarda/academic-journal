import {Button} from "react-bootstrap";
import {faCheck, faPen} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {SubmissionStatus} from "@responses/submission";
import {SubmissionService} from "@services/submission/submissionService";
import {useState} from "react";

/**
 * @property submissionId id of the submission we are publishing
 * @property published status of the submission and whether we have published it
 */
interface PublishSubmissionProps {
    submissionId: string;
    published: SubmissionStatus;
}

export default function PublishSubmission(props: PublishSubmissionProps) {
    const submissionService = new SubmissionService();
    const [published, setPublished] = useState(false);
    const [error, setError] = useState("");

    function publishSubmission() {
        submissionService.publish(props.submissionId).then(res => {
            if (res.data && res.data.status === "success")
                setPublished(true);
        }).catch(error => {
            if (error.response.data.status === "failure" && error.response.data.reason)
                setError(error.response.data.reason);
        });
    }

    const showPublishButton = props.published === SubmissionStatus.PUBLISHED || published;

    if (!showPublishButton)
        return (
            <div>
                <Button onClick={publishSubmission} variant="warning"><FontAwesomeIcon icon={faPen} /> Publish</Button>
                <br />
                <p className="text-danger">{error}</p>
            </div>
        );

    return (
        <>
            <Button variant="dark" disabled><FontAwesomeIcon icon={faCheck} /> Published</Button>
        </>
    );
}