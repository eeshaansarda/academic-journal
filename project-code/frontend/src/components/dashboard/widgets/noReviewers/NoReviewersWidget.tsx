import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import {SubmissionService} from "@services/submission/submissionService";
import {v4} from "uuid";
import InfiniteScroll from "react-infinite-scroller";
import SubmissionCard from "@components/submission/card/SubmissionCard";
import {SuccessIcon} from "@components/icon/Icons";

/**
 * Widget for showing elements with no reviewers in the system
 */
function AllSubmissionsHaveReviewers() {
    return (
        <div className="text-muted text-center">
            <h2><SuccessIcon /></h2>
            <h2>It appears all submissions have reviewers assigned.</h2>
        </div>
    )
}

export default function NoReviewersWidget() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [numSubmissions, setNumSubmissions] = useState(0);
    const [widgetId] = useState(`no-reviewers-widget-${v4()}`);

    const submissionService = new SubmissionService();

    function getSubmissionsWithNoReviewers(pageNumber: number) {
        submissionService.getSubmissionsWithNoReviewers(pageNumber).then(res => {
            if (res.data && res.data.status === "success") {
                setSubmissions([...submissions, ...res.data.submissions]);
                setNumSubmissions(res.data.numSubmissions);
            }
        });
    }

    useEffect(() => {
        getSubmissionsWithNoReviewers(1);
    }, []);

    const submissionComponents = submissions.map(submission => <SubmissionCard key={submission.submissionId} submission={submission} />);

    return (
        <div style={{overflowY: 'auto'}} id={widgetId}>
            <div className="d-flex justify-content-center">
                <InfiniteScroll
                    pageStart={1}
                    loadMore={getSubmissionsWithNoReviewers}
                    hasMore={submissions.length !== numSubmissions}
                    useWindow={false}
                    getScrollParent={() => document.getElementById(widgetId)}>
                    {submissions.length > 0 ? submissionComponents : <AllSubmissionsHaveReviewers />}
                </InfiniteScroll>
            </div>
        </div>
    );
}