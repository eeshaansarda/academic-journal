import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import {UserSelector} from "@components/userSelector/UserSelector";
import {UserRole} from "@role/role";
import {RoleRestricted} from "@components/roleRestricted/RoleRestricted";
import {Option} from "react-bootstrap-typeahead/types/types";
import {IUserIdentity} from "@responses/user";
import {SubmissionService} from "@services/submission/submissionService";
import {Offcanvas, Form} from "react-bootstrap";
import AuthorRestricted from "@components/roleRestricted/AuthorRestricted";
import ExportSubmission from "@components/submission/export/ExportSubmission";
import ReportSubmission from "@components/submission/reportSubmission/ReportSubmission";
import DeleteSubmission from "@components/submission/delete/DeleteSubmission";

interface SubmissionMetadataProps {
    submissionId: string;
    show: boolean;
    close: () => void;
}

export default function SubmissionMetadata(props: SubmissionMetadataProps) {
    const [submission, setSubmission] = useState<Submission | null>(null);
    const submissionService = new SubmissionService();

    function addReviewers(users: Option[]) {
        const userResult = users as (IUserIdentity & Option)[];

        submissionService.assignReviewers(props.submissionId, userResult.map(user => user.id)).then(response => {
            if (response.data && response.data.status === "success")
                getSubmission();
        });
    }

    function getSubmission() {
       submissionService.getSubmission(props.submissionId).then(res => {
            if (res.data && res.data.status === "success") {
                setSubmission(res.data.submission);
            }
        });
    }

    function addCoAuthors(users: Option[]) {
        const userResult = users as (IUserIdentity & Option)[];

        submissionService.assignCoAuthors(props.submissionId, userResult.map(user => user.id)).then(response => {
            if (response.data && response.data.status === "success")
                getSubmission();
        });
    }

    useEffect(() => {
        getSubmission();
    }, []);

    if (!submission)
        return null;

    return (
        <Offcanvas placement='end' show={props.show} onHide={props.close}>
            <Offcanvas.Header closeButton />
            <Offcanvas.Body>
                <RoleRestricted roleRequired={UserRole.EDITOR}>
                    <h5 className="mb-3">Reviewers</h5>
                    <UserSelector selected={submission?.reviewers ?? []}
                                  onChange={addReviewers} />
                    <Form.Text muted>
                        Assign reviewers to review the submission, this can be used to decide whether or not to publish
                        the submission.
                    </Form.Text>
                    <hr />
                </RoleRestricted>

                <AuthorRestricted author={submission.author.id}>
                    <h5 className="mb-3">Export To Another Journal</h5>
                    <ExportSubmission submissionId={submission.submissionId} />
                    <Form.Text muted>
                        Export the submission to another journal in SuperGroup C. This transfers the submission and it's
                        reviews.
                    </Form.Text>
                    <hr />
                </AuthorRestricted>

                <AuthorRestricted author={submission.author.id}>
                    <h5 className="mb-3">Co-Authors</h5>
                    <UserSelector selected={submission?.coAuthors ?? []}
                                  onChange={addCoAuthors} />
                    <Form.Text muted>
                        Assign Co-Authors to the submission. This gives these individuals the same rights as the author.
                    </Form.Text>
                    <hr />
                </AuthorRestricted>

                <h5 className="mb-3">Report</h5>
                <ReportSubmission author={submission.author} />
                <Form.Text muted>
                    Report the submission for breaking the terms and conditions.
                </Form.Text>

                <hr />

                <AuthorRestricted author={submission.author.id}>
                    <h5 className="mt-3 mb-3">Delete</h5>
                    <DeleteSubmission submission={submission} />
                    <Form.Text muted>
                        <br />
                        Delete the submission from the system. This cannot be undone.
                    </Form.Text>
                </AuthorRestricted>
            </Offcanvas.Body>
        </Offcanvas>
    );
}