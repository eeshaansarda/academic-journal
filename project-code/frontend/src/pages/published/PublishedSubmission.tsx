import {Col, Container, Row} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {PublicationService} from "@services/publication/publicationService";
import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import DownloadPublication from "@components/published/download/DownloadPublication";
import PublicationDoesNotExist from "@components/published/error/PublicationDoesNotExist";
import SupportingDocuments from "@components/submission/supportingDocument/SupportingDocuments";

interface PublishedSubmissionParams {
    publicationId: string;
}

export default function PublishedSubmission() {
    const { publicationId } = useParams<PublishedSubmissionParams>();
    const publicationService = new PublicationService();
    const [publication, setPublication] = useState<Submission | null>(null);

    useEffect(() => {
        publicationService.getPublication(publicationId).then(res => {
            if (res.data && res.data.status === "success")
                setPublication(res.data.publication);
        })
    }, [publicationId]);

    if (!publication)
        return (
        <Container className="mt-4">
            <PublicationDoesNotExist />
        </Container>
        );

    return (
        <Container className="p-1">
            <Row>
                <Col>
                    <div>
                        <h2>{publication.title}</h2>
                        <p className="text-muted">by {publication.author.username}</p>
                    </div>
                </Col>

                <Col>
                    <DownloadPublication publicationId={publication.submissionId} />
                </Col>
            </Row>
            <Row>
                <SupportingDocuments submission={publication} isPublication={true} />
            </Row>

            <Row>
                <Col>
                    <div dangerouslySetInnerHTML={{__html: publication.description}} />
                </Col>
            </Row>
        </Container>
    );
}