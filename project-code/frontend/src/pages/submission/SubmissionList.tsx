import { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { Container, Row, Col} from 'react-bootstrap';
import PaginationButtons, { PageData } from '@components/pagination/PaginationButtons';
import {ISubmissionService, SubmissionService} from "@services/submission/submissionService";
import {Submission} from "@responses/submission";
import SubmissionCard from "@components/submission/card/SubmissionCard";
import NoSubmissions from "@components/submission/noSubmissions/NoSubmissons";
import SearchComponent, {SortFilter} from "@components/search/SearchComponent";
import {SubmissionIcon} from "@components/icon/Icons";

const MAX_SUBMISSIONS_PER_PAGE = 10;

enum SubmissionsFilters {
    RECENTLY_UPLOADED = -1,
    LEAST_RECENTLY_UPLOADED = 1
}

function SubmissionList() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [pageData, setPageData] = useState<PageData>({ pageNumber: 1, numPages: 0 });
    const submissionService : ISubmissionService = new SubmissionService();
    const [searchTitle, setSearchTitle] = useState("");
    const [sort, setSort] = useState<SubmissionsFilters>(SubmissionsFilters.RECENTLY_UPLOADED);

    const filters: SortFilter[] = [{ eventKey: SubmissionsFilters.RECENTLY_UPLOADED.toLocaleString(), title: "Recently Uploaded" },
        { eventKey: SubmissionsFilters.LEAST_RECENTLY_UPLOADED.toLocaleString(), title: "Least Recently Uploaded" }];

    function loadSubmissions(pageNumber: number) {
        submissionService.getSubmissions({pageNumber, title: searchTitle, sort}).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setSubmissions(response.data.submissions);
                setPageData({ pageNumber, numPages: Math.ceil(response.data.numSubmissions / MAX_SUBMISSIONS_PER_PAGE)})
            }
        });
    }

    useEffect(() => {
        loadSubmissions(1);
    }, [sort, searchTitle]);

    return (
        <Container>
            <h2><SubmissionIcon /> Submissions</h2><hr/>

            <Row>
                <Col>
                    <div>
                        <SearchComponent onSearchChange={val => setSearchTitle(val)}
                                         onFilterChanged={key => setSort(parseInt(key))}
                                         filters={filters} placeholder="Search by Title" />
                    </div>
                </Col>
            </Row>
            <hr/>

            <Row>
                <Col>
                    {submissions.length !== 0 ?
                        <div className="d-flex flex-wrap justify-content-center">
                            {submissions.map(s =>
                                <SubmissionCard key={s.submissionId} submission={s} />
                            )}
                        </div> :
                        <div className="text-center">
                            <NoSubmissions />
                        </div>
                    }

                </Col>
            </Row>

            <Row>
                <Col className="d-flex justify-content-center">
                    <PaginationButtons
                        pageData={pageData}
                        pageChanged={pageNumber => loadSubmissions(pageNumber)}/>
                </Col>
            </Row>
        </Container>
    );
}

export default withRouter(SubmissionList);
