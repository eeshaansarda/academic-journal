import {ErrorIcon, TrendingSubmissionsIcon} from "@components/icon/Icons";
import {Col} from "react-bootstrap";
import PublicationCard from "@components/published/card/PublicationCard";
import {useEffect, useState} from "react";
import {PublicationService} from "@services/publication/publicationService";
import {Submission} from "@responses/submission";

/**
 * Component that represents the trending submissions. This is the most visited submissions (expect the submission
 * of the day).
 */
export default function TrendingSubmissions() {
    const [featuredPublications, setFeaturedPublications] = useState<Submission[]>([]);
    const publicationService = new PublicationService();

    useEffect(() => {
        publicationService.getFeaturedPublications().then(res => {
            if (res.data && res.data.status === "success")
                setFeaturedPublications(res.data.publications);
        });
    }, []);


    if (featuredPublications.length === 0)
        return (
            <div className="mt-2 border p-5 text-center">
                <h4><ErrorIcon /></h4>
                <p>We were unable to get the featured submissions at this time</p>
            </div>);

    return (
        <div className="mt-2 border p-5">
            <h4><TrendingSubmissionsIcon /></h4>

            <h2>Featured Submissions</h2>

            <Col className="d-flex flex-wrap justify-content-center">
                {featuredPublications.map(publication => <PublicationCard key={publication.submissionId}
                                                                          publicationId={publication.submissionId}
                                                                          title={publication.title}
                                                                          description={publication.description} />)}
            </Col>
        </div>
    )
}