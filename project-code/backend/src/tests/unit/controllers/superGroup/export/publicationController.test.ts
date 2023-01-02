import {describe} from "mocha";
import PublicationController from "@controllers/api/superGroup/export/publication/publicationController";
import UserRepositoryMock from "@mocks/repository/user/userRepositoryMock";
import {SubmissionRepositoryMock} from "@mocks/repository/submission/submissionRepositoryMock";
import sinon from "sinon";
import {
    createFakeSubmission,
    generateGetSubmissionHeader,
    generateMetaDataHeader, generateReviewWithOwner
} from "@tests/seed/fakeData";
import {v4 as uuid} from "uuid";
import {response} from "express";
import {FileSenderMock} from "@mocks/helper/fileMock";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, NotFoundError, UnauthorizedError} from "routing-controllers";
import {BearerTokenMock} from "@mocks/helper/bearerTokenMock";
import {expect} from "chai";
import {v4 as uuidv4} from "uuid";
import {ApiSGComment} from "@validation/body/apiSGPublication";
import {generateValidCommentModel, generateValidUserModel} from "@tests/seed/fakeModels";
import {IComment} from "@models/comment/commentModel";
import {IUser} from "@models/user/userModel";

after(() => {
    sinon.restore();
});

describe("Publication Controller Tests", () => {
    let publicationController: PublicationController;
    let userRepositoryMock: UserRepositoryMock;
    let submissionRepositoryMock: SubmissionRepositoryMock;
    let tokenVerifierMock: BearerTokenMock;
    let fileSenderMock: FileSenderMock;

    beforeEach(() => {
        publicationController = new PublicationController();
        publicationController.userModel = userRepositoryMock = new UserRepositoryMock();
        publicationController.submissionModel = submissionRepositoryMock = new SubmissionRepositoryMock();
        publicationController.bearerVerifier = tokenVerifierMock = new BearerTokenMock();
        publicationController.fileSender = fileSenderMock = new FileSenderMock();
    });

    describe("getSubmission endpoint tests", () => {
        it("throws an UnauthorizedError if we cannot verify the bearer token", async () => {
            const publicationHeader = generateGetSubmissionHeader();
            const submissionId = uuid();
            const mockResponse = sinon.stub(response)

            tokenVerifierMock.verifyBearerToken.returns(false);

            await expectThrowsAsync(UnauthorizedError,
                async () => await publicationController.getSubmission(publicationHeader, submissionId, mockResponse))
        });

        it("throws a BadRequest error if the submission does not exist", async () => {
            const publicationHeader = generateGetSubmissionHeader();
            const submissionId = uuid();
            const mockResponse = sinon.stub(response);

            tokenVerifierMock.verifyBearerToken.returns(true);
            submissionRepositoryMock.getOne.returns(null);

            await expectThrowsAsync(BadRequestError,
                async () => await publicationController.getSubmission(publicationHeader, submissionId, mockResponse));
        });

        it("throws NotFoundError if the submission does not exist on the file system", async () => {
            const publicationHeader = generateGetSubmissionHeader();
            const submissionId = uuid();
            const mockResponse = sinon.stub(response);

            tokenVerifierMock.verifyBearerToken.returns(true);

            const submission = createFakeSubmission();
            submission.performValidation.throws(Error);

            tokenVerifierMock.verifyBearerToken.returns(true);
            submissionRepositoryMock.getOne.returns(submission);

            await expectThrowsAsync(NotFoundError,
                async () => await publicationController.getSubmission(publicationHeader, submissionId, mockResponse));
        });

        it("calls sendFile if the submission is valid", async () => {
            const publicationHeader = generateGetSubmissionHeader();
            const submissionId = uuid();
            const mockResponse = sinon.stub(response);

            tokenVerifierMock.verifyBearerToken.returns(true);
            submissionRepositoryMock.getOne.returns(createFakeSubmission());
            
            await publicationController.getSubmission(publicationHeader, submissionId, mockResponse);

            expect(fileSenderMock.sendFile.called).to.be.true;
        });
    });

    describe("getMetadata endpoint tests", () => {
        it("throws an Unauthorized error if the bearer token is invalid", async () => {
            const getMetadataHeader = generateMetaDataHeader();
            const submissionId = uuidv4();

            tokenVerifierMock.verifyBearerToken.returns(false);

            await expectThrowsAsync(UnauthorizedError,
                async () => await publicationController.getMetadata(getMetadataHeader, submissionId));
        })

        it("throws a BadRequestError if the submission could not be found", async () => {
            const getMetadataHeader = generateMetaDataHeader();
            const submissionid = uuidv4();

            tokenVerifierMock.verifyBearerToken.returns(true);
            submissionRepositoryMock.getOne.returns(null);

            await expectThrowsAsync(BadRequestError,
                async () => await publicationController.getMetadata(getMetadataHeader, submissionid))
        });

        it("throws a BadRequestError if the author does not exist", async () => {
            const getMetadataHeader = generateMetaDataHeader();
            const submissionid = uuidv4();
            const submission = createFakeSubmission();

            tokenVerifierMock.verifyBearerToken.returns(true);
            submissionRepositoryMock.getOne.returns(submission);
            userRepositoryMock.getOne.returns(null);

            await expectThrowsAsync(BadRequestError,
                async () => await publicationController.getMetadata(getMetadataHeader, submissionid));
        });

        it("returns the metadata of each submission upon success", async () => {
            const getMetadataHeader = generateMetaDataHeader();
            const submissionid = uuidv4();
            const submission = createFakeSubmission();
            const review = generateReviewWithOwner();
            submission.getReviews.returns([review]);
            review.comments = [generateValidCommentModel(), generateValidCommentModel(), generateValidCommentModel()] as any as [IComment];

            const author = generateValidUserModel();

            tokenVerifierMock.verifyBearerToken.returns(true);
            submissionRepositoryMock.getOne.returns(submission);
            submissionRepositoryMock.getOneAndPopulate.returns(submission);
            userRepositoryMock.getOne.returns(author);

            const result = await publicationController.getMetadata(getMetadataHeader, submissionid);

            expect(result.status).to.be.eql('ok');
            expect(result.reviews).to.be.eql([
                {
                    owner: (review.owner as IUser).id,
                    comments: review.comments.map(comment => ApiSGComment.createApiSgCommentFromDocument(comment, comment.commenter as IUser)),
                    createdAt: review.created_at.valueOf()
                }
            ])
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});