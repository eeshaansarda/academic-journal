import {Button} from "react-bootstrap";
import {SubmissionService} from "@services/submission/submissionService";
import fileDownload from "js-file-download";

/**
 * @param submissionId the id of the submission we are downloading
 * @param version the version to download
 */
interface DownloadVersionProps {
    submissionId: string;
    version: string;
}

/**
 * Component for downloading a specific version of a submission
 *
 * @param submissionId the id of the submission we are downloading
 * @param version the version we are downloading
 */
export default function DownloadVersion({ submissionId, version }: DownloadVersionProps) {
    const submissionService = new SubmissionService();

    function downloadVersion() {
        submissionService.downloadSubmission(submissionId, version).then(r => {
            const fileNameRegex = /filename=(?<filename>.+)$/;
            const match = fileNameRegex.exec(r.headers['content-disposition']);

            if (!match?.groups?.filename)
                throw new Error("content disposition was not specified");

            fileDownload(r.data, match.groups.filename);
        });
    }

    return (
        <Button variant="link" onClick={downloadVersion}>
            {version}
        </Button>
    );
}