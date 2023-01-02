import { useEffect, useState } from "react";
import {Submission} from "@responses/submission";
import {SubmissionService} from "@services/submission/submissionService";
import UserTag from "@components/user/tag/UserTag";

interface SubmissionDetailsProps {
    submissionId: string;
}

export default function SubmissionDetails({ submissionId } : SubmissionDetailsProps) {
    const [submission, setSubmission] = useState<Submission | null>(null);
    const submissionService = new SubmissionService();

    useEffect(() => {
        submissionService.getSubmission(submissionId).then(response => {
            if (response.data.status && response.data.status === 'success') {
                if (JSON.stringify(response.data.submission) !== JSON.stringify(submission)) {
                    setSubmission(response.data.submission);
                }
            }
        });
    }, []);

    if (!submission)
        return null;

    const authorTags = [<UserTag key={submission.author.id} userId={submission.author.id} username={submission.author.username} />,
        ...submission.coAuthors.map(c => <UserTag key={submission.author.id} userId={c.id} username={c.username} />)];
    return (
        <>
            <h3>{submission.title}</h3>
            <h6 className="text-secondary">by {authorTags} </h6>
            <div dangerouslySetInnerHTML={{__html: submission.description}}/>
        </>
    );
}