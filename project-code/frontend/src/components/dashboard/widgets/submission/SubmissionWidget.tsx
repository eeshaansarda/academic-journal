import {useEffect, useState} from "react";
import {SubmissionService} from "@services/submission/submissionService";
import {Submission} from "@responses/submission";
import InfiniteScroll from "react-infinite-scroller";
import {v4} from "uuid";
import SubmissionCard from "@components/submission/card/SubmissionCard";
import NoSubmissions from "@components/submission/noSubmissions/NoSubmissons";


export default function SubmissionWidget() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [numSubmissions, setNumSubmission] = useState<Number>(0);
    const [uniqueId] = useState(v4());

    const submissionService = new SubmissionService();

    function getSubmissions(pageNumber: number) {
        submissionService.getMySubmissions(pageNumber, "", 1).then(response => {
            if (response.data && response.data.status === "success") {
                setSubmissions([...submissions, ...response.data.submissions]);
                setNumSubmission(response.data.numSubmissions);
            }
        });
    }

    const submissionComponents = submissions.map((submission) =>
            <SubmissionCard key={submission.submissionId} submission={submission} />);

    useEffect(() => {
        getSubmissions(1);
    }, []);


    return (
        <div style={{overflowY: "auto"}} id={`submission-widget-${uniqueId}`}>
                <div className="d-flex justify-content-center">
                    <InfiniteScroll
                        pageStart={1}
                        loadMore={getSubmissions}
                        hasMore={submissions.length !== numSubmissions}
                        useWindow={false}
                        getScrollParent={() => document.getElementById(`submission-widget-${uniqueId}`)}>
                        {submissions.length > 0 ? submissionComponents : <NoSubmissions />}
                    </InfiniteScroll>
                </div>
        </div>
    );
}
