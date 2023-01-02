import {SubmissionService} from "@services/submission/submissionService";
import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import SubmissionCard from "@components/submission/card/SubmissionCard";
import InfiniteScroll from "react-infinite-scroller";
import {v4} from "uuid";
import {Container, Spinner} from "react-bootstrap";
import {SubmissionIcon} from "@components/icon/Icons";
import NoSubmissions from "@components/submission/noSubmissions/NoSubmissons";

/**
 * @property userId the id of the user who we are getting the submissions of
 */
interface UserSubmissionsProps {
    userId: string;
}

/**
 * Component for displaying a list of the user's publications
 * @param userId the user id of the user we are getting their publications of
 */
export default function UserSubmissions({userId}: UserSubmissionsProps) {
    const submissionService = new SubmissionService();
    const [numSubmissions, setNumSubmissions] = useState<number>(0);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [id] = useState(v4());

    const usersContainerId = `users-submissions-${id}`;

    function getUserSubmissions(pageNumber: number) {
        submissionService.getSubmissions({title: "", userId, sort: 1, pageNumber})
            .then(res => {
                if (res.data && res.data.status === "success") {
                    setSubmissions([...submissions, ...res.data.submissions]);
                    setNumSubmissions(res.data.numSubmissions);
                }
            });
    }

    useEffect(() => {
        setSubmissions([]);
        getUserSubmissions(1);
    }, [userId]);

    const submissionComponents = submissions.map(s => <SubmissionCard key={s.submissionId} submission={s}/>);

    return (<Container>
        <h5 className="text-center"><SubmissionIcon/> Submissions</h5>
        <div className="d-flex justify-content-center flex-wrap" style={{overflowY: 'auto', height: '40rem'}}
             id={usersContainerId}>
            <InfiniteScroll
                pageStart={1}
                loadMore={getUserSubmissions}
                hasMore={submissions.length !== numSubmissions}
                useWindow={false}
                getScrollParent={() => document.getElementById(usersContainerId)}
                loader={<div className="d-flex justify-content-center"><Spinner variant="primary" animation="border" /></div>}>
                {submissionComponents.length === 0 ? <NoSubmissions showCreate={false} /> : submissionComponents}
            </InfiniteScroll>
        </div>
    </Container>);
}