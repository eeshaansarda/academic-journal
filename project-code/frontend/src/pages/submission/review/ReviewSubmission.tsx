import {Col, Container, Row} from "react-bootstrap";
import {Route, Switch, useParams, useRouteMatch} from "react-router-dom";
import SubmissionDetails from "@components/submission/SubmissionDetails";
import SubmissionDirectory from "@components/submission/SubmissionDirectory";
import {useEffect, useState} from "react";
import Comments from "@components/comment/Comments";
import {useHistory} from "react-router";
import {ReviewFile} from "@pages/submission/review/ReviewFile";
import PostReview from "@components/review/postDecision/PostReview";
import ReviewerRestricted from "@components/roleRestricted/ReviewerRestricted";
import ReviewDecisionCard from "@components/review/decisionSection/ReviewDecisionCard";
import {Review} from "@responses/review";
import {ReviewService} from "@services/reviewService/reviewService";
import {resourceNotFound} from "@config/paths";


interface ReviewParams {
    submission: string;
    review: string;
}

interface ReviewSubmissionProp {
    currentDirectory: string;
}

export function ReviewSubmission({ currentDirectory } : ReviewSubmissionProp) {
    const [ currentDir, setCurrentDir ] = useState(currentDirectory || '/');
    const [review, setReview] = useState<Review | null>(null);
    const { path, url } = useRouteMatch();
    const params = useParams<ReviewParams>();
    const reviewService = new ReviewService();


    const history = useHistory();

    function travelToFile(pathToFile: string) {
        history.push(`${url}/file/${encodeURIComponent(pathToFile)}`);
    }

    function getReview() {
        reviewService.getReview(params.review).then(res => {
            if (res.data && res.data.status === "success")
                setReview(res.data.review);
        }).catch(_ => history.replace(resourceNotFound));
    }

    useEffect(() => {
        getReview();
    }, [params.review]);


    if (!review)
        return null;

    return (
        <Container>
            <Switch>
                <Route exact path={path}>
                    <Row>
                        <Col>
                            <SubmissionDetails submissionId={params.submission} />
                        </Col>
                        <ReviewerRestricted submissionId={params.submission}>
                            <Col>
                                <div className="float-end">
                                    <ReviewerRestricted submissionId={params.submission}>
                                        <PostReview onReviewPosted={getReview} reviewId={params.review} />
                                    </ReviewerRestricted>
                                </div>
                            </Col>
                        </ReviewerRestricted>
                    </Row>

                    <SubmissionDirectory pathToFile={currentDir} submissionId={params.submission}
                                         reviewId={params.review} changeDirectory={setCurrentDir}
                                         openFile={travelToFile} />

                    <ReviewDecisionCard review={review} />

                    <h4 className="mt-2">Comments</h4><hr />
                    <Comments reviewId={params.review} />
                </Route>
                <Route path={`${path}/file/:pathToFile`}>
                    <ReviewFile />
                </Route>
            </Switch>
        </Container>
    );
}
