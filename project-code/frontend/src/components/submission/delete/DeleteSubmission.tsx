import {Button, FormControl} from "react-bootstrap";
import {Submission} from "@responses/submission";
import React, {useState} from "react";
import {SubmissionService} from "@services/submission/submissionService";
import {useHistory} from "react-router-dom";
import {submissionsPath} from "@config/paths";

interface DeleteSubmissionProps {
    submission: Submission;
}

export default function DeleteSubmission(props: DeleteSubmissionProps) {
    const [confirmation, setConfirmation] = useState("");
    const submissionService = new SubmissionService();
    const history = useHistory();


    function deleteSubmission() {
        submissionService.deleteSubmission(props.submission.submissionId).then(res => {
            if (res.data && res.data.status === "success")
                history.replace(submissionsPath);
        });
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmation(e.target.value);
    };

    return <>
        <FormControl placeholder={`Type ${props.submission.title} to confirm`} onChange={onChange} />
        <Button variant="warning" disabled={confirmation !== props.submission.title} onClick={deleteSubmission} className="mt-2">
            Delete
        </Button>
    </>;
}

