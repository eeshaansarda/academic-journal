import {PublicationService} from "@services/publication/publicationService";
import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import {v4} from "uuid";
import PublicationCard from "@components/published/card/PublicationCard";
import InfiniteScroll from "react-infinite-scroller";
import NoPublications from "@components/published/error/NoPublications";

/**
 * Widget for showing the user's published items in the system
 */
export default function PublicationWidget() {
    const [publications, setPublications] = useState<Submission[]>([]);
    const [numPublications, setNumPublications] = useState<number>(0);
    const [uniqueId] = useState(`publication-widget-${v4()}`);

    const publicationService = new PublicationService();

    function getPublications(pageNumber: number) {
        publicationService.getMyPublications(pageNumber).then(res => {
            if (res.data && res.data.status === "success") {
                setPublications([...publications, ...res.data.publications]);
                setNumPublications(res.data.numPublications);
            }
        })
    }

    useEffect(() => {
        getPublications(1);
    }, []);

    const publicationComponents = publications.map(p => <PublicationCard title={p.title} description={p.description} publicationId={p.submissionId} />);

    return (
        <div style={{overflowY: "auto"}} id={uniqueId}>
            <div className="d-flex justify-content-center flex-wrap">
                <InfiniteScroll
                    pageStart={1}
                    loadMore={getPublications}
                    hasMore={publications.length !== numPublications}
                    useWindow={false}
                    getScrollParent={() => document.getElementById(uniqueId)}>
                    {publicationComponents.length > 0 ? publicationComponents : <NoPublications />}
                </InfiniteScroll>
            </div>
        </div>
    );
}