import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import fileDownload from "js-file-download";
import {SubmissionService} from "@services/submission/submissionService";

/**
 * the id of the submission to download
 */
export interface IDownloadSubmission {
    submissionId: string;
}

/**
 * Component for downloading a submission
 *
 * @param props properties injecting into the component
 */
export function DownloadSubmission(props: IDownloadSubmission) {
    const submissionService = new SubmissionService();

    function downloadSubmission() {
        submissionService.downloadSubmission(props.submissionId).then(r => {
            const fileNameRegex = /filename=(?<filename>.+)$/;
            const match = fileNameRegex.exec(r.headers['content-disposition']);

            if (!match?.groups?.filename)
                throw new Error("content disposition was not specified");

            fileDownload(r.data, match.groups.filename);
        });
    }

    return (
        <Button variant="outline-success" onClick={downloadSubmission}><FontAwesomeIcon icon={faDownload}/></Button>
    );
}