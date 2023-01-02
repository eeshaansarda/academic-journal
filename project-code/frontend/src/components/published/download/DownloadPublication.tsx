import {Button} from "react-bootstrap";
import {DownloadIcon} from "@components/icon/Icons";
import {PublicationService} from "@services/publication/publicationService";
import fileDownload from "js-file-download";

interface DownloadPublicationProps {
    publicationId: string;
}

export default function DownloadPublication(props: DownloadPublicationProps) {
    const publicationService = new PublicationService();

    function downloadSubmission() {
        publicationService.downloadPublication(props.publicationId).then(r => {
            const fileNameRegex = /filename=(?<filename>.+)$/;
            const match = fileNameRegex.exec(r.headers['content-disposition']);

            if (!match?.groups?.filename)
                throw new Error("content disposition was not specified");

            fileDownload(r.data, match.groups.filename);
        });
    }


    return (
        <Button variant="danger" onClick={(e) => downloadSubmission()}>
            <DownloadIcon /> Download
        </Button>
    );
}