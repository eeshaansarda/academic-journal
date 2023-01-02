import {Submission} from "@responses/submission";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {selectUser} from "@slices/userSlice";
import {SubmissionService} from "@services/submission/submissionService";

/**
 * @property submissionId the id of the submission
 * @property children the component to render should the user be a reviewer
 */
interface ReviewerRestrictedProps {
    submissionId: string;
    children?: React.ReactNode | React.ReactNode[];
}

export default function ReviewerRestricted(props: ReviewerRestrictedProps) {
    const [submission, setSubmission] = useState<Submission | null>(null);
    const submissionService = new SubmissionService();

    useEffect(() => {
        submissionService.getSubmission(props.submissionId).then(response => {
            if (response.data && response.data.status === "success")
                setSubmission(response.data.submission);
        });
    }, []);

    const currentUser = useSelector(selectUser);
    const reviewers = submission?.reviewers;

    if (!reviewers || !currentUser)
        return null;

    const reviewerIds = reviewers.map(reviewer => reviewer.id);
    if (reviewerIds.indexOf(currentUser?.id) === -1)
        return null;

    return (
        <>
            {props.children}
        </>);
}