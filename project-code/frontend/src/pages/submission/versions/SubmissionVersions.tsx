import {useHistory, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {SubmissionService} from "@services/submission/submissionService";
import {Container} from "react-bootstrap";
import {ClockIcon} from "@components/icon/Icons";
import DownloadVersion from "@components/submission/version/DownloadVersion";
import AddVersionForm from "@components/submission/version/AddVersionForm";
import {resourceNotFound} from "@config/paths";
import CollaboratorRestricted from "@components/roleRestricted/CollaboratorRestricted";
import {Submission} from "@responses/submission";

interface SubmissionVersionParams {
    submission: string;
}

export default function SubmissionVersions() {
    const params = useParams<SubmissionVersionParams>();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [versions, setVersions] = useState<string[]>([]);
    const submissionService = new SubmissionService();
    const history = useHistory();

    function getVersions() {
        submissionService.getVersions(params.submission).then(res => {
            if (res.data && res.data.status === "success")
                setVersions(res.data.versions);
        }).catch(_ => history.replace(resourceNotFound));
    }

    function getSubmission() {
        submissionService.getSubmission(params.submission).then(res => {
            if (res.data && res.data.status === "success")
                setSubmission(res.data.submission);
        });
    }

    useEffect(() => {
      getVersions();
      getSubmission();
    }, [params.submission]);

    if (!submission)
        return null;

    const versionComponents = versions.map(version => <DownloadVersion key={version} submissionId={params.submission} version={version} />);
    return (
        <Container>
            <h2><ClockIcon /> Versions</h2>
            <hr />
            {versionComponents}
            
            <CollaboratorRestricted collaborators={submission.coAuthors} author={submission.author}>
                <AddVersionForm submissionId={params.submission} onVersionAdded={getVersions} />
            </CollaboratorRestricted>
        </Container>)
}