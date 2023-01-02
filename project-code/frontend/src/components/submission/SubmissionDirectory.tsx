import {useEffect, useState} from "react";
import { Container, Table } from "react-bootstrap";
import * as path from "path";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import BreadCrumbs from "@components/breadcrumbs/BreadCrumbs";
import {SubmissionService} from "@services/submission/submissionService";
import moment from "moment";
import {ReviewIcon} from "@components/icon/Icons";

interface SubmissionDirectoryProps {
    pathToFile: string;
    submissionId: string;
    changeDirectory: (newDir: string) => void;
    openFile: (pathToFile: string) => void;
    reviewId?: string;
}

interface SubmissionDirectoryEntryProps {
    entry: SubmissionDirectoryEntryResponse;
    changeDirectory: (newDir: string) => void;
    openFile: (pathToFile: string) => void;
}

interface SubmissionDirectoryEntryResponse {
    fileName: string;
    isDirectory: boolean,
    lastModification: string;
    numComments?: number;
}

export function SubmissionDirectoryEntry({ entry, changeDirectory, openFile } : SubmissionDirectoryEntryProps) {
    const icon = entry.isDirectory ?
        <FontAwesomeIcon icon={faFolderOpen} /> :
        <FontAwesomeIcon icon={faFile} />;

    return (
        <tr style={{cursor: "pointer"}} onClick={() => entry.isDirectory ? changeDirectory(entry.fileName) : openFile(entry.fileName)}>
            <td>{icon}</td>
            <td>{path.basename(entry.fileName)} </td>
            <td>{moment(entry.lastModification).format('DD/MM/YYYY')}</td>
            {entry.numComments !== undefined ? (<td><ReviewIcon /> {entry.numComments}</td>) : null }
        </tr>
    );
}

export default function SubmissionDirectory({submissionId,
                                            pathToFile,
                                            changeDirectory,
                                            openFile,
                                            reviewId} : SubmissionDirectoryProps) {
    const [entries, setEntries] = useState<SubmissionDirectoryEntryResponse[]>([]);
    const submissionService = new SubmissionService();

    useEffect(() => {
        let isMounted = true;

        submissionService.getDents(submissionId, pathToFile, reviewId).then(response => {
                if (isMounted && response.data && response.data.status === 'success') {
                    setEntries(response.data.entries);
                }
        });

        return () => { isMounted = false; }
     }, [pathToFile, submissionId]);

    const rows = entries.map((entry, index) =>
        <SubmissionDirectoryEntry key={index} entry={entry} changeDirectory={changeDirectory} openFile={openFile} />);

    return (
        <Container className="mt-5">
            <BreadCrumbs pathToFile={pathToFile} onPathClick={(path) => changeDirectory(path)} />
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Type of File</th>
                    <th>File Name</th>
                    <th>Last Modification</th>
                    {reviewId ? <th>Comments</th> : null }
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        </Container>
    );
}