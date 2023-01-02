import {Container} from "react-bootstrap";
import {Row, Col} from "react-bootstrap";
import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import {PublicationService} from "@services/publication/publicationService";
import PublicationCard from "@components/published/card/PublicationCard";
import SearchComponent, {SortFilter} from "@components/search/SearchComponent";
import NoPublications from "@components/published/error/NoPublications";
import PaginationButtons, {PageData} from "@components/pagination/PaginationButtons";
import {useLocation} from "react-router-dom";

enum PublicationFilters {
    RECENTLY_UPLOADED = -1,
    LEAST_RECENTLY_UPLOADED = 1
}

const MAX_PUBLICATIONS_PER_PAGE = 10;

export default function PublishedSubmissions() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search)

    const initialValue = queryParams.get("search");

    const [retrievedSubmissions, setRetrievedSubmissions] = useState<Submission[]>([]);
    const [searchTitle, setSearchTitle] = useState(initialValue ?? "");
    const publicationService = new PublicationService();
    const [sort, setSort] = useState<PublicationFilters>(PublicationFilters.RECENTLY_UPLOADED);
    const [pageData, setPageData] = useState<PageData>({ pageNumber: 1, numPages: 0 });

    const filters: SortFilter[] = [{ eventKey: PublicationFilters.RECENTLY_UPLOADED.toLocaleString(), title: "Recently Uploaded" },
                    { eventKey: PublicationFilters.LEAST_RECENTLY_UPLOADED.toLocaleString(), title: "Least Recently Uploaded" }];

    function getSubmissions(pageNumber: number) {
        publicationService.getPublishedSubmissions({pageNumber, title: searchTitle, sort}).then(res => {
            if (res.data && res.data.status === "success") {
                setRetrievedSubmissions(res.data.publications);
                setPageData({ pageNumber, numPages: Math.ceil(res.data.numPublications / MAX_PUBLICATIONS_PER_PAGE)})
            }
        });
    }

    useEffect(() => {
        getSubmissions(1);
    }, [sort, searchTitle])

    return (
        <div>
            <Container className="p-1">
                <Row className="mb-2">
                    <Col>
                        <h3>Publications</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <SearchComponent filters={filters} placeholder="Search for publications"
                                        onFilterChanged={key => setSort(parseInt(key))}
                                        onSearchChange={setSearchTitle}
                                        initialValue={initialValue ?? undefined} />
                    </Col>
                </Row>

                <Row>
                    <Col>
                        {retrievedSubmissions.length !== 0 ? <div className="d-flex justify-content-center flex-wrap">
                            {retrievedSubmissions.map(publication => <PublicationCard publicationId={publication.submissionId} title={publication.title} description={publication.description} />)}
                        </div> : <div className="mt-2"> <NoPublications /> </div> }
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-center">
                        <PaginationButtons pageData={pageData} pageChanged={getSubmissions} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}