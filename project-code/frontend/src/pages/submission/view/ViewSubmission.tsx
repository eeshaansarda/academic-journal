import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom";
import {Col, Container, Dropdown, DropdownButton, Row} from "react-bootstrap";
import SubmissionDetails from "@components/submission/SubmissionDetails";
import SubmissionDirectory from "@components/submission/SubmissionDirectory";
import {useEffect, useState} from "react";
import {ReviewSubmission} from "@pages/submission/review/ReviewSubmission";
import AddReview from "@components/review/add/AddReview";
import ReviewsViewer from "@components/submission/review/ReviewsViewer";
import {ViewFile} from "@pages/submission/view/ViewFile";
import {SubmissionService} from "@services/submission/submissionService";
import ReviewerRestricted from "@components/roleRestricted/ReviewerRestricted";
import SubmissionMetadata from "@pages/submission/view/metadata/SubmissionMetadata";
import {Submission} from "@responses/submission";
import PublishSubmission from "@components/submission/publish/PublishSubmission";
import * as paths from "@config/paths";
import {resourceNotFound, supportingDocumentsPath} from "@config/paths";
import SupportingDocuments from "@components/submission/supportingDocument/SupportingDocuments";
import {MetadataIcon} from "@components/icon/Icons";
import {RoleRestricted} from "@components/roleRestricted/RoleRestricted";
import {UserRole} from "@role/role";
import AuthorRestricted from "@components/roleRestricted/AuthorRestricted";


interface SubmissionParam {
    submission: string;
}

export default function ViewSubmission () {
    const [ currentDir, setCurrentDir ] = useState('/');
    const [ submission, setSubmission ] = useState<Submission | null>(null);
    const [ showMetadata, setShowMetadata] = useState(false);
    const [ showReviews, setShowReviews ] = useState(false);

    const submissionService = new SubmissionService();

    const {path, url} = useRouteMatch();
    const history = useHistory();
    const params = useParams<SubmissionParam>();
    const versionsPath = paths.versionsPath.replace(':submission', params.submission);

    function onReviewAdd(reviewId: string) {
        history.push(`${url}/review/${reviewId}`);
    }

    useEffect(() => {
        submissionService.getSubmission(params.submission).then(res => {
            if (res.data.status && res.data.status === 'success') {
                setSubmission(res.data.submission);
            }
        }).catch(_ => {
            history.replace(resourceNotFound);
        });
    }, [params.submission]);

    if (!submission) {
        return null;
    }

    return (
        <Container>
            <Switch>
                <Route exact path={path}>
                    <Row>
                        <Col>
                            <SubmissionDetails submissionId={params.submission}/>
                        </Col>
                        <Col>
                            <RoleRestricted roleRequired={UserRole.EDITOR}>
                                <PublishSubmission submissionId={params.submission} published={submission.status} />
                            </RoleRestricted>
                        </Col>
                        <Col>
                            <DropdownButton
                                variant="light"
                                title={<MetadataIcon />} className="float-end">
                                <Dropdown.Item eventKey="1" onClick={() => setShowMetadata(true)}>Settings</Dropdown.Item>
                                <Dropdown.Item eventKey="2" onClick={() => setShowReviews(true)}>Reviews</Dropdown.Item>
                                <Dropdown.Item eventKey="3" onClick={() => history.push(versionsPath)}>Versions</Dropdown.Item>
                                <AuthorRestricted author={submission.author.id}>
                                    <Dropdown.Item eventKey="4"
                                                   onClick={() => history.push(supportingDocumentsPath.replace(':submission', params.submission))}>
                                        Supporting Documents
                                    </Dropdown.Item>
                                </AuthorRestricted>
                            </DropdownButton>
                        </Col>
                    </Row>
                    <Row>
                        <SupportingDocuments isPublication={false} submission={submission} />
                    </Row>
                    <Row>
                        <ReviewerRestricted submissionId={params.submission}>
                            <Col>
                                <div className="mt-2">
                                    <AddReview submissionId={params.submission} onReviewAdded={onReviewAdd}/>
                                </div>
                            </Col>
                        </ReviewerRestricted>
                    </Row>

                    <SubmissionDirectory
                        pathToFile={currentDir}
                        submissionId={params.submission}
                        changeDirectory={setCurrentDir}
                        openFile={path => history.push(`${url}/file/${encodeURIComponent(path)}`)}/>

                    <ReviewsViewer show={showReviews} onClose={() => setShowReviews(false)} submissionId={params.submission} />

                    <SubmissionMetadata close={() => setShowMetadata(false)} submissionId={params.submission} show={showMetadata} />
                </Route>
                <Route path={`${path}/file/:pathToFile`}>
                    <ViewFile />
                </Route>
                <Route path={`${path}/review/:review`}>
                    <ReviewSubmission currentDirectory={currentDir} />
                </Route>
            </Switch>
        </Container>
    );
}
