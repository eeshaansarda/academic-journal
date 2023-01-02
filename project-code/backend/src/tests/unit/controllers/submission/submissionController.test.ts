import SubmissionController from "@controllers/api/submission/submissionController";
import {describe} from "mocha";
import sinon from "sinon";
import {SubmissionRepositoryMock} from "@mocks/repository/submission/submissionRepositoryMock";
import {ZipCompressorMock, ZipExtractorMock, ZipSenderMock} from "@mocks/helper/zip";
import {
    createExportSubmissionBody,
    createFakeAuthor,
    createFakeFile,
    createFakeSubmission,
    createSessionUser,
    generateApiAssignReviewer,
    generateUser,
    createSubmissionBody,
    generateApiAddCoAuthor,
    generateDirectoryEntry,
    generateGetFileQuery,
    generateReview, generateSubmission
} from "@tests/seed/fakeData";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, HttpError, NotFoundError, UnauthorizedError} from "routing-controllers";
import {expect} from "chai";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {SubmissionQuery} from "@validation/query/submissionQuery";
import {ExportSubmissionMock} from "@mocks/helper/exportSubmissionMock";
import {response} from "express";
import mongoose from "mongoose";
import UserRepositoryMock from "@mocks/repository/user/userRepositoryMock";
import * as faker from "faker";
import {ApiReview} from "@validation/body/apiReview";
import {generateValidSubmissionModel} from "@tests/seed/fakeModels";
import {IUser} from "@models/user/userModel";
import NotificationService from "@server/services/notificationService";
import SocketService from "@server/services/socketService";
import SubmissionService from "@server/services/submissionService";
import { SubmissionDoesNotExistError } from "@server/models/submission/submissionModel";

after(() => {
    sinon.restore();
});

describe("Submission Controller Tests", () => {
    let submissionController: SubmissionController;
    let submissionRepositoryMock: SubmissionRepositoryMock;
    let zipExtractorMock: ZipExtractorMock;
    let zipCompressorMock: ZipCompressorMock;
    let exportSubmissionMock: ExportSubmissionMock;
    let zipSenderMock: ZipSenderMock;
    let userRepositoryMock: UserRepositoryMock;

    beforeEach(() => {
        submissionController = new SubmissionController(new NotificationService(new SocketService()), new SubmissionService());
        submissionController.submissionModel = submissionRepositoryMock = new SubmissionRepositoryMock();
        submissionController.zipCompressor = zipCompressorMock = new ZipCompressorMock();
        submissionController.zipExtractor = zipExtractorMock = new ZipExtractorMock();
        submissionController.submissionExport = exportSubmissionMock = new ExportSubmissionMock();
        submissionController.zipSender = zipSenderMock = new ZipSenderMock();
        submissionController.userModel = userRepositoryMock = new UserRepositoryMock();
    });

    describe("Upload Tests", () => {
        it("Throws a BadRequest error if a problem occurred when creating a submission", async () => {
            zipCompressorMock.compressToZip.throws(new Error('Mock error'));

            await expectThrowsAsync(BadRequestError,
                async () => await submissionController.upload(createSubmissionBody(), createSessionUser(), createFakeFile() as Express.Multer.File)
            );
        });
    });

    describe("Download Tests", () => {
        it("Throws an error if the submission does not exist in the database", async () => {
            const query: SubmissionQuery = { submissionId: uuidv4() };

            submissionRepositoryMock.getOne.returns(null);

            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(NotFoundError,
                async () => submissionController.download(query, mockResponse as any) );
        });

        it("Throws an error if the submission does not exist in the file system", async () => {
            const query: SubmissionQuery = { submissionId: uuidv4() };

            const submission = generateValidSubmissionModel();
            submission.performValidation = sinon.stub().throws(Error);

            submissionRepositoryMock.getOne.returns(submission);

            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(NotFoundError,
                async () => submissionController.download(query, mockResponse as any));
        });

        it("Sends the zip to thee user if the submission exists", async () => {
            const query: SubmissionQuery = { submissionId: uuidv4() };

            const submission = generateValidSubmissionModel();
            submission.performValidation = sinon.stub().returns(true);

            submissionRepositoryMock.getOne.returns(submission);

            const mockResponse = sinon.stub(response);

            await submissionController.download(query, mockResponse);

            expect(zipSenderMock.sendZip.called).to.be.true;
        });
    });

    describe("Export Tests", () => {
        it("throws an unauthorized error if the user is not the author of the submission", () => {
            const exportSubmission = createExportSubmissionBody();
            const sessionUser = createSessionUser();
            const userDocument = {
                id: sessionUser.id,
                _id: new mongoose.Types.ObjectId()
            };
            const submission = createFakeSubmission();
            submission.directory = exportSubmission.id;

            submissionRepositoryMock.getOne.returns(submission);
            userRepositoryMock.getOne.returns(userDocument);

            expectThrowsAsync(UnauthorizedError, async () => submissionController.export(sessionUser, exportSubmission));
        });

        it("throws a HttpError if exporting the submission failed", () => {
            const exportSubmissionBody = createExportSubmissionBody();
            const session = createSessionUser();
            const userDocument = {
                id: session.id,
                _id: new mongoose.Types.ObjectId()
            };
            const submission = createFakeSubmission();
            submission.directory = exportSubmissionBody.id;
            submission.author = userDocument._id;

            submissionRepositoryMock.getOne.returns(submission);
            userRepositoryMock.getOne.returns(userDocument);

            exportSubmissionMock.generateExportToken.returns(uuidv4());
            exportSubmissionMock.exportSubmission.returns(false);

            expectThrowsAsync(HttpError, async () => submissionController.export(session, exportSubmissionBody));
        });

        it("sends a submission with status success if we were able to export the submission", async () => {
            const exportSubmissionBody = createExportSubmissionBody();
            const session = createSessionUser();
            const userDocument = {
                id: session.id,
                _id: new mongoose.Types.ObjectId()
            };
            const submission = createFakeSubmission();
            submission.directory = exportSubmissionBody.id;
            submission.author = userDocument._id;

            submissionRepositoryMock.getOne.returns(submission);
            userRepositoryMock.getOne.returns(userDocument);

            exportSubmissionMock.generateExportToken.returns(uuidv4());
            exportSubmissionMock.exportSubmission.returns(true);

            const result = await submissionController.export(session, exportSubmissionBody);

            expect(result).to.be.eql({ status: "success" });
        });
    });

    describe("Get File Tests", () => {
        it("throws a NotFoundError if the submission does not exist", async () => {
            const getFileQuery = generateGetFileQuery();
            submissionRepositoryMock.getOne.returns(null);
            await expectThrowsAsync(NotFoundError, async () => await submissionController.getFile(getFileQuery))
        });

        it("throws a NotFoundError if the submission does not exist on the server", async () => {
            const getFileQuery = generateGetFileQuery();
            const submission = createFakeSubmission();
            submission.directory = getFileQuery.submissionId;
            submission.performValidation.throws(Error);
            submissionRepositoryMock.getOne.returns(submission);

            await expectThrowsAsync(NotFoundError, async () => await submissionController.getFile(getFileQuery));
        });

        it("throws a NotFoundError if we could not convert the given file to a string", async () => {
            const getFileQuery = generateGetFileQuery();
            const submission = createFakeSubmission();
            submission.directory = getFileQuery.submissionId;
            submissionRepositoryMock.getOne.returns(submission);

            zipExtractorMock.getFileAsString.throws(Error);
            await expectThrowsAsync(NotFoundError, async () => await submissionController.getFile(getFileQuery));
        });

        it("returns success if we successfully retrieved the contents of the given file", async () => {
            const submission = createFakeSubmission();
            const getFileQuery = { ...generateGetFileQuery(), pathToFile: submission.getLatestVersion() };

            submission.directory = getFileQuery.submissionId;
            submissionRepositoryMock.getOne.returns(submission);

            const getFileRet = ["text/plain", faker.random.words()];
            zipExtractorMock.getFileAsString.returns(getFileRet);

            const result = await submissionController.getFile(getFileQuery);

            expect(result).to.eql({ status: 'success', file: {
                content: getFileRet[1],
                contentType: getFileRet[0],
                fileName: path.basename(getFileQuery.pathToFile)
            }});
        });
    });

    describe("Get Entries Tests", () => {
        it("throws a NotFoundError if the submission does not exist", async () => {
            const getFileQuery = generateGetFileQuery();

            submissionRepositoryMock.getOne.returns(null);

            await expectThrowsAsync(NotFoundError,
                async () => await submissionController.getEntries(getFileQuery));
        });

        it("throws a NotFoundError if the submission does not exist locally", async () => {
            const getFileEntry = generateGetFileQuery();
            const submission = createFakeSubmission();
            submission.performValidation.throws(Error);
            submissionRepositoryMock.getOne.returns(submission);

            await expectThrowsAsync(NotFoundError,
                async () => await submissionController.getEntries(getFileEntry));
        });

        it("throws a NotFoundError if we were not able to get the file entries", async () => {
            const getFileEntry = generateGetFileQuery();
            const submission = createFakeSubmission();
            submissionRepositoryMock.getOne.returns(submission);
            zipExtractorMock.getFileEntries.throws(Error);

            await expectThrowsAsync(NotFoundError,
                async () => await submissionController.getEntries(getFileEntry));
        });

        it("returns success if we were able to successfully retrieve the file contents", async () => {
            const getFileEntry = generateGetFileQuery();
            const submission = createFakeSubmission();
            submissionRepositoryMock.getOne.returns(submission);

            const entries = [generateDirectoryEntry(), generateDirectoryEntry(), generateDirectoryEntry()];
            zipExtractorMock.getFileEntries.returns(entries);

            const result = await submissionController.getEntries(getFileEntry);

            expect(result).to.be.eql({
                status: "success",
                entries
            });
        });
    });

    describe("Submission Metadata Tests", () => {
        it("throws NotFoundError if the submission could not be found", async () => {
            submissionRepositoryMock.getOneAndPopulate.returns( null);
            await expectThrowsAsync(NotFoundError, async () => await submissionController.getSubmissionMetadata(uuidv4()));
        });

        it("returns the metadata of the submission if it could be found", async () => {
            const submission = createFakeSubmission() as any;
            submission.author = createFakeAuthor();
            submission.reviewers = [generateUser(), generateUser()]

            submissionRepositoryMock.getOneAndPopulate.returns(submission);

            const result = await submissionController.getSubmissionMetadata(submission.directory);
            expect(result).to.be.eql({
                status: "success",
                submission: {
                    submissionId: submission.directory,
                    fileName: submission.filename,
                    description: submission.description,
                    initialVersion: submission.versions[0].version,
                    title: submission.title,
                    published: submission.created_at.valueOf(),
                    author: {
                        id: submission.author.id,
                        username: submission.author.username
                    },
                    reviewers: submission.reviewers.map((reviewer: IUser) => ({ id: reviewer.id, username: reviewer.username })),
                    coAuthors: submission.coAuthors.map((author: IUser) => ({ id: author.id, username: author.username })),
                    status: "In Review"
                }
            });
        });
    });

    describe("Get Reviews Tests", () => {
        it("throws a NotFoundError if the submission does not exist", async () => {
            const sessionUser = createSessionUser();

            submissionRepositoryMock.getOne.returns(null);
            await expectThrowsAsync(NotFoundError, async () => submissionController.getReviews(uuidv4(), sessionUser))
        });

        it("returns all of the reviews of the submission if the submission exists and all reviews have been submitted", async () => {
            const sessionUser = createSessionUser();
            const submission = createFakeSubmission();
            const reviews = [generateReview(), generateReview(), generateReview()];
            submission.getReviews.returns(reviews);
            submission.allReviewsSubmitted.returns(true);

            submissionRepositoryMock.getOne.returns(submission);

            const result = await submissionController.getReviews(submission.directory, sessionUser);

            expect(result).to.be.eql({
                status: "success",
                reviews: reviews.map(review => ApiReview.createApiReviewFromDocument(review as any))
            });
        });

        it ("returns the reviews for the session user if the submission exists and not all reviews have been submitted", async () => {
            const sessionUser = createSessionUser();
            const submission = createFakeSubmission();
            const reviews = [generateReview()];
            submission.getReviewsForUser.returns(reviews);
            submission.allReviewsSubmitted.returns(false);

            submissionRepositoryMock.getOne.returns(submission);

            const result = await submissionController.getReviews(submission.directory, sessionUser);
            expect(result).to.be.eql({
                status: "success",
                reviews: reviews.map(review => ApiReview.createApiReviewFromDocument(review as any))
            })
        });
    });

    describe ("assignReviewer Tests", () => {
        it ("throws an error if we could not assign a reviewer", async () => {
            const assignReviewer = generateApiAssignReviewer();
            submissionRepositoryMock.assignReviewers.throws(new Error("some error occurred"));

            await expectThrowsAsync(BadRequestError,
                async () => await submissionController.assignReviewers(assignReviewer));
        });

        it ("returns success if we could assign the reviewer", async () => {
            const assignReviewer = generateApiAssignReviewer();

            const result = await submissionController.assignReviewers(assignReviewer);

            expect(result.status).to.be.eql("success");
        });
    });

    describe ("addCoAuthor tests", () => {
        it ("throws an error if the submission does not exist", async () => {
            const apiAddCoAuthor = generateApiAddCoAuthor();
            const sessionUser = createSessionUser();

            submissionRepositoryMock.assignCoAuthors.throws(new SubmissionDoesNotExistError());

            await expectThrowsAsync(NotFoundError,
                async () => await submissionController.assignCoAuthors(apiAddCoAuthor, sessionUser));
        });

        it ("throws a BadRequestError if we were unable to add a coauthor", async () => {
            const apiAddCoAuthor = generateApiAddCoAuthor();
            const submission = generateSubmission();
            const sessionUser = createSessionUser();

            submissionRepositoryMock.getOneAndPopulate.returns(submission);
            submissionRepositoryMock.assignCoAuthors.throws(Error);
            sessionUser.id = (submission.author as IUser).id;

            await expectThrowsAsync(BadRequestError,
                async () => await submissionController.assignCoAuthors(apiAddCoAuthor, sessionUser));
        });

        it ("returns success if we were able to add a coauthor to the submission", async () => {
            const apiAddCoAuthor = generateApiAddCoAuthor();
            const submission = generateSubmission();
            const sessionUser = createSessionUser();

            submissionRepositoryMock.getOneAndPopulate.returns(submission);
            sessionUser.id = (submission.author as IUser).id;

            const result = await submissionController.assignCoAuthors(apiAddCoAuthor, sessionUser);

            expect(result.status).to.be.eql("success");
        });
    });

    describe ("publish tests", () => {
        it ("throws a BadRequest error if we could set published to true", async () => {
            submissionRepositoryMock.publish.throws(new Error("some message here"));
            await expectThrowsAsync(BadRequestError, async () => submissionController.publish(uuidv4(), createSessionUser()));
        });

        it ("returns success if we could set published to true", async () => {
            const submission = generateSubmission();
            submissionRepositoryMock.getOneAndPopulate.returns(submission);
            
            const result = await submissionController.publish(uuidv4(), createSessionUser());
            expect(result.status).to.be.eql("success");
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});