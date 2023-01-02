import {Container, Spinner} from "react-bootstrap";
import {PublishedIcon} from "@components/icon/Icons";
import {useEffect, useState} from "react";
import {v4} from "uuid";
import {Submission} from "@responses/submission";
import {PublicationService} from "@services/publication/publicationService";
import InfiniteScroll from "react-infinite-scroller";
import NoPublications from "@components/published/error/NoPublications";
import PublicationCard from "@components/published/card/PublicationCard";

/**
 * @property userId id of the user we are getting their publications of
 */
export interface UserPublicationsProps {
    userId: string;
}

/**
 * Component for getting the user's publications. Displayed in their profile.
 *
 * @param userId the id of the user we are getting their publications of
 */
export default function UserPublications({ userId }: UserPublicationsProps) {
    const [id] = useState(v4());
    const [numPublications, setNumPublications] = useState(0);
    const [publications, setPublications] = useState<Submission[]>([]);

    const publicationService = new PublicationService();

    const containerId = `user-publications-${id}`;

    function getUserPublications(pageNumber: number) {
        publicationService.getPublishedSubmissions({ pageNumber, sort: 1, userId, title: "" })
            .then(res => {
                if (res.data && res.data.status === "success") {
                    setPublications([...publications, ...res.data.publications]);
                    setNumPublications(res.data.numPublications);
                }
            });
    }

    useEffect(() => {
        setPublications([]);
        getUserPublications(1);
    }, [userId]);

    const publicationComponents = publications.map(p => <PublicationCard key={p.submissionId}
                                                                         title={p.title}
                                                                         description={p.description}
                                                                         publicationId={p.submissionId} />);

    return (
        <Container>
            <h5 className="text-center"><PublishedIcon /> Published</h5>

            <div id={containerId} className="d-flex justify-content-center flex-wrap" style={{overflowY: 'auto', height: '40rem'}}>
                <InfiniteScroll
                    pageStart={1}
                    loadMore={getUserPublications}
                    hasMore={publications.length !== numPublications}
                    useWindow={false}
                    getScrollParent={() => document.getElementById(containerId)}
                    loader={<div className="d-flex justify-content-center"><Spinner variant="primary" animation="border" /></div>}>
                    {publications.length === 0 ? <NoPublications /> : publicationComponents}
                </InfiniteScroll>
            </div>
        </Container>
    );
}