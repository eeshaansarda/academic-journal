import {describe} from "mocha";
import {SubmissionsQuery} from "@validation/query/submissionsQuery";
import SubmissionsController from "@controllers/api/submission/submissionsController";
import {SubmissionRepositoryMock} from "@mocks/repository/submission/submissionRepositoryMock";
import {expect} from "chai";
import {createFakeSubmission} from "@tests/seed/fakeData";
import {ApiSubmission} from "@validation/body/apiSubmission";

describe("Submissions Controller Tests", () => {
    let submissionsController: SubmissionsController;
    let submissionRepositoryMock: SubmissionRepositoryMock;

    beforeEach(() => {
        submissionsController = new SubmissionsController();
        submissionsController.submissionModel = submissionRepositoryMock = new SubmissionRepositoryMock();
    });


    describe("getSubmissions endpoint tests", () => {
        it("Returns no submissions when there are no submissions", async () => {
            const submissionsQuery: SubmissionsQuery = {
                pageNumber: 0,
                title: "Some Title",
                sort: 1
            };

            submissionRepositoryMock.findByTitle.returns([0, []]);

            const result = await submissionsController.getSubmissions(submissionsQuery);

            expect(result).to.be.eql({
                status: 'success',
                submissions: [],
                numSubmissions: 0
            });
        });

        it("Returns a list of submissions when there are submissions to be retrieved", async () => {
            const submissionsQuery: SubmissionsQuery = {
                pageNumber: 0,
                title: "Some Title",
                sort: 1
            };

            const returnedResults = [createFakeSubmission(), createFakeSubmission(), createFakeSubmission()];

            submissionRepositoryMock.findByTitle.returns([3, returnedResults]);

            const result = await submissionsController.getSubmissions(submissionsQuery);

            expect(result).to.be.eql({
                status: 'success',
                submissions: returnedResults.map(submission => ApiSubmission.createApiSubmissionFromDocument(submission as any)),
                numSubmissions: 3
            });
        });
    });
});