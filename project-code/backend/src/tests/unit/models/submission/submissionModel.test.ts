import {describe} from "mocha";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {createFakeFile, createSubmissionBody} from "@tests/seed/fakeData";
import {
    AuthorDoesNotExistError, DocumentDoesNotExistError,
    fileUtilities,
    ISubmission,
    ReviewDecisionNotDeterminedError,
    ReviewerNotFoundError,
    SubmissionDoesNotExistError,
    SubmissionHasNoReviewsError,
    SubmissionModel, VersionAlreadyExistsError, VersionDoesNotExistError
} from "@models/submission/submissionModel";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import * as faker from "faker";
import {expect} from "chai";
import {IUser} from "@models/user/userModel";
import sinon from "sinon";
import path from "path";
import { config } from "@config/config";
import {
    createReviewModel,
    generateValidSubmissionModel,
    generateValidSubmissionModelWithAuthor,
    generateValidUserModel,
    createVersionModel, generateValidSupportingDocumentModel, generateValidPublicationModel, generatePublicationWithAuthor
} from "@tests/seed/fakeModels";
import {SubmissionsQuery} from "@validation/query/submissionsQuery";
import {v4} from "uuid";
import {ReviewDecision} from "@models/review/reviewModel";
import {Multer} from "multer";
import {IVersion} from "@models/submission/version/versionModel";
import {
    ISupportingDocument,
} from "@models/submission/supportingDocument/supportingDocumentModel";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});

describe("Submission Model Tests", function () {
    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    describe("createSubmission Tests", () => {
        it("throws an error if the author does not exist", async () => {
            const apiSubmission = createSubmissionBody();
            const file = createFakeFile() as Express.Multer.File;

            await expectThrowsAsync(AuthorDoesNotExistError,
                async () => await SubmissionModel.createSubmission(apiSubmission, file));
        });

        it("adds a new submission to the submission collection", async () => {
            const apiSubmission = createSubmissionBody();

            const author = generateValidUserModel();
            apiSubmission.author = {
                id: author.id,
                username: author.username
            };
            await author.save();
            await author.save();

            const file = createFakeFile() as Express.Multer.File;

            await SubmissionModel.createSubmission(apiSubmission, file);

            expect(SubmissionModel.getOne({ id: apiSubmission.submissionId })).to.be.not.undefined;
        });
    });

    describe("findAndPopulate Tests", () => {
        it("populates the author", async () => {
            const apiSubmission = createSubmissionBody();
            const author = generateValidUserModel();
            apiSubmission.author = {
                id: author.id,
                username: author.username
            };
            await author.save();
            const file = createFakeFile() as Express.Multer.File;

            await SubmissionModel.createSubmission(apiSubmission, file);

            const result = await SubmissionModel.findAndPopulate(apiSubmission.submissionId);
            const authorModel = result?.author as IUser;

            expect(authorModel.email).to.be.eql(author.email);
        });
    });

    describe("findByTitle Tests", () => {
        it("returns an empty list when there are no submissions", async () => {
            const options : SubmissionsQuery = {
                title: "some-title",
                sort: 1,
                pageNumber: 0
            };

            const [numSubmissions, submissions] = await SubmissionModel.findByTitle(options);

            expect(submissions).to.be.empty;
            expect(numSubmissions).to.be.eql(0);
        });

        it("returns all of the submissions when the number of submissions is less than the page size", async () => {
            const submissions = [generateValidSubmissionModel(), generateValidSubmissionModel(), generateValidSubmissionModel()];
            for (const submission of submissions) {
                await submission.save();
            }

            const options : SubmissionsQuery = {
                title: "",
                sort: 1,
                pageNumber: 1
            };

            const [numSubmissions, submissionsResult] = await SubmissionModel.findByTitle(options);

            expect(numSubmissions).to.be.eql(submissions.length);
            expect(submissionsResult.length).to.be.eql(submissions.length);
        });

        it("returns only part of the submissions when there are more submissions than the page size", async () => {
            const submissions = Array.from(Array(11)).map(_ => generateValidSubmissionModel());
            for (const submission of submissions) {
                await submission.save();
            }

            const options : SubmissionsQuery = {
                title: "",
                sort: 1,
                pageNumber: 1
            };

            const [numSubmissions, submissionsResult] = await SubmissionModel.findByTitle(options);
            expect(numSubmissions).to.be.eql(submissions.length);
            expect(submissionsResult.length).to.be.eql(10);
        });

        it("returns the final page", async () => {
            const submissions = Array.from(Array(19)).map(_ => generateValidSubmissionModel());
            for (const submission of submissions) {
                await submission.save();
            }

            const options : SubmissionsQuery = {
                title: "",
                sort: 1,
                pageNumber: 2
            };


            const [numSubmissions, submissionsResult] = await SubmissionModel.findByTitle(options);

            expect(numSubmissions).to.be.eql(submissions.length);
            expect(submissionsResult.length).to.be.eql(9);
        });

        it ("if a userid is specified it filters the list of submissions by the user id", async () => {
            const submissions = Array.from(Array(19)).map(_ => generateValidSubmissionModel());

            const author = generateValidUserModel();
            await author.save();

            submissions.push(generateValidSubmissionModelWithAuthor(author._id), generateValidSubmissionModelWithAuthor(author._id));
            for (const submission of submissions) {
                await submission.save();
            }

            const options : SubmissionsQuery = {
                title: "",
                sort: 1,
                pageNumber: 1,
                userId: author.id
            }

            const[numDocuments, submissionsResult] = await SubmissionModel.findByTitle(options);

            expect(numDocuments).to.be.eql(2);
            expect(new Set(submissionsResult.map(submission => (submission.author as IUser).id))).to.have.length(1);
        });

        it ("if a userid is specified and the user is a coAuthor then a submission is loaded", async () => {
            const coAuthor = generateValidUserModel();
            await coAuthor.save();

            const submission = generateValidSubmissionModel();
            submission.coAuthors = [coAuthor._id];
            await submission.save();

            const options: SubmissionsQuery = {
                title: "",
                sort: 1,
                pageNumber: 1,
                userId: coAuthor.id
            };

            const [numDocuments, submissions] = await SubmissionModel.findByTitle(options);

            expect(numDocuments).to.be.eql(1);
            expect(submissions[0].id).to.be.eql(submission.id);
        });
    });

    describe("performValidation", async () => {
        it("throws an error if the file does not exist", async () => {
            fileUtilities.fileExists = sinon.stub().returns(false);

            const submission = generateValidSubmissionModel();

            await expectThrowsAsync(SubmissionDoesNotExistError,
                async () => await submission.performValidation());
        });

        it("does not throw an error if the submission exists", async () => {
            fileUtilities.fileExists = sinon.stub().returns(true);

            const submission = generateValidSubmissionModel();

            await submission.performValidation();
        });
    });

    describe("getPath Tests", async () => {
        it("concatenates the base submission folder and the submissionId", async () => {
            const submission = generateValidSubmissionModel();
            const latest = submission.versions[0];

            expect(submission.getPath()).to.be.eql(path.join(config.baseSubmissionFolder, `${latest.directory}.zip`));
        });

        it ("returns the path to the given version if the version is specified", async () => {
            const submission = generateValidSubmissionModel();
            const version = { version: faker.random.word(), directory: v4(), fileName: faker.random.word() };

            submission.versions.push(version as IVersion);
            expect(submission.getPath(version.version)).to.be.eql(path.join(config.baseSubmissionFolder, `${version.directory}.zip`));
        });

        it ("throws an error if the version does not exist", async () => {
            const submission = generateValidSubmissionModel();
            expect(() => submission.getPath(v4())).throws(VersionDoesNotExistError);
        });
    });

    describe("getReviews Tests", () => {
        it("returns an empty list when there are no reviews associated with a submission", async () => {
            const submission = generateValidSubmissionModel();
            expect(submission.getReviews()).to.be.empty;
        });

        it("populates the owner and submission property", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();
            const user = generateValidUserModel();
            await user.save();
            const reviews = [createReviewModel(submission, user), createReviewModel(submission, user), createReviewModel(submission, user)];
            for (const review of reviews) {
                await review.save();
            }

            const result = await submission.getReviews();

            expect(result.length).to.be.eql(3);
            expect((result[0].owner as IUser).username).to.be.not.undefined;
            expect((result[0].submissionId as ISubmission).id).to.be.not.undefined;
        });

        it ("only returns reviews associated with the latest version", async () => {
            const submission = generateValidSubmissionModel();

            const user = generateValidUserModel();
            await user.save();

            const reviewsBeforeVersion = [createReviewModel(submission, user), createReviewModel(submission, user)];
            for (const review of reviewsBeforeVersion) {
                await review.save();
            }

            submission.versions.unshift(createVersionModel() as IVersion);
            await submission.save();

            const reviewsAfterVersion = [createReviewModel(submission, user), createReviewModel(submission, user)];
            for (const review of reviewsAfterVersion) {
                await review.save();
            }

            const result = await submission.getReviews();

            expect(result).to.have.length(reviewsAfterVersion.length);
            expect(result.map(r => r.version)).to.have.members(reviewsAfterVersion.map(r => r.version));
        });
    });

    describe ("deleteSupportingDocument tests", () => {
        it ("throws an error if the supporting document does not exist", async () => {
            const submission = generateValidSubmissionModel();
            submission.supportingDocuments = [generateValidSupportingDocumentModel() as ISupportingDocument];

            await submission.save();

            await expectThrowsAsync(DocumentDoesNotExistError,
                async () => submission.deleteSupportingDocument(v4()));
        });

        it ("removes the supporting document from the list of supporting documents if it exists", async () => {
            const submission = generateValidSubmissionModel();
            const supportingDocument = generateValidSupportingDocumentModel() as ISupportingDocument;
            submission.supportingDocuments = [supportingDocument];

            await submission.save();

            await submission.deleteSupportingDocument(submission.supportingDocuments[0].id);

            expect(submission.supportingDocuments.filter(doc => doc.id === supportingDocument.id)).to.be.empty;
        });
    });

    describe ("allReviewsSubmitted tests", () => {
        it ("returns true if all the reviews have been published", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();
            const user = generateValidUserModel();
            await user.save();
            const reviews = [createReviewModel(submission, user), createReviewModel(submission, user), createReviewModel(submission, user)];
            reviews.forEach(review => review.status.decision = ReviewDecision.READY);

            for (const review of reviews) {
                await review.save();
            }

            const result = await submission.allReviewsSubmitted();

            expect(result).to.be.true;
        });

        it ("returns false if not all reviews have been published", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();
            const user = generateValidUserModel();
            await user.save();

            const reviews = [createReviewModel(submission, user), createReviewModel(submission, user)];
            for (const review of reviews) {
                await review.save();
            }

            const result = await submission.allReviewsSubmitted();

            expect (result).to.be.false;
        });
    });

    describe ("getReviewsForUser tests", () => {
        it ("throws ReviewerNotFoundError if the reviewer does not exist", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            await expectThrowsAsync(ReviewerNotFoundError, async () => submission.getReviewsForUser(v4()));
        });

        it ("returns an empty list if the corresponding user does not have any reviews for the submission", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const user = generateValidUserModel();
            await user.save();

            const result = await submission.getReviewsForUser(user.id);

            expect(result).to.be.empty;
        });

        it ("returns the reviews for the given user", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const user = generateValidUserModel();
            await user.save();

            const reviews = [createReviewModel(submission, user), createReviewModel(submission, user)];
            for (const review of reviews) {
                await review.save();
            }

            const result = await submission.getReviewsForUser(user.id);

            expect(result.map(review => review.id)).to.have.members(reviews.map(review => review.id));
        });
    });

    describe("getAndPopulate Tests", () => {
        it("populates the author property", async () => {
            const submission = generateValidSubmissionModel();
            const author = generateValidUserModel()
            submission.author = author;

            await author.save();
            await submission.save();

            let authorModel = (await SubmissionModel.getOneAndPopulate({})).author as IUser;
            expect(authorModel.id).to.be.not.undefined;
        });
    });

    describe("getOneAndPopulate Tests", () => {
        it("populates the author property", async () => {
            const submission = generateValidSubmissionModel();
            const author = generateValidUserModel()
            submission.author = author;

            await author.save();
            await submission.save();

            let submissions = await SubmissionModel.getAndPopulate({});
            let authors = submissions.map(submission => submission.author as IUser);
            let allDefined = authors.every(author => author.id !== undefined);

            expect(allDefined).to.be.true;
        });
    })

    describe ("assignReviewers", () => {
        it ("throws a ReviewerNotFoundError if the reviewer does not exist", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            await expectThrowsAsync(
                ReviewerNotFoundError,
                async () => await SubmissionModel.assignReviewers(submission.directory, [v4()])
            );
        });

        it ("throws a submission does not exist if the submission could not be found", async () => {
            const user = generateValidUserModel();
            await user.save();

            await expectThrowsAsync(SubmissionDoesNotExistError,
                async () => await SubmissionModel.assignReviewers(v4(), [user.id]));
        });

        it ("adds a reviewer to the submission", async () => {
            const user = generateValidUserModel();
            await user.save();

            const submission = generateValidSubmissionModel();
            await submission.save();

            await SubmissionModel.assignReviewers(submission.directory, [user.id]);

            const submissionDoc = await SubmissionModel.findById(submission);

            expect(submissionDoc?.reviewers).to.contain(user._id);
        });

        it ("does not add the reviewer to the submission if the reviewer is already assigned", async () => {
            const user = generateValidUserModel();
            await user.save();

            const submission = generateValidSubmissionModel();
            await submission.save();

            await SubmissionModel.assignReviewers(submission.directory, [user.id, user.id]);

            const submissionDoc = await SubmissionModel.findById(submission);
            expect(submissionDoc?.reviewers).to.have.length(1);
        });
    });

    describe ("addCoAuthor tests", () => {
        it ("throws an error if the user does not exist", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            await expectThrowsAsync(AuthorDoesNotExistError,
                async () => await SubmissionModel.assignCoAuthors(submission.directory, [v4()]));
        });

        it ("throws an error if the submission does not exist", async () => {
            const user = generateValidUserModel();
            await user.save();

            await expectThrowsAsync(SubmissionDoesNotExistError,
                async () => await SubmissionModel.assignCoAuthors(v4(), [user.id]));
        });

        it ("adds the coauthor to the submission if the user and submission exists", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const user = generateValidUserModel();
            await user.save();

            await SubmissionModel.assignCoAuthors(submission.directory, [user.id]);

            const resultDoc = await SubmissionModel.findOne({ id: submission.id });

            expect(resultDoc?.coAuthors).to.contain(user._id);
        });

        it ("does not add the user to the coAuthors if it is already in the list", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const user = generateValidUserModel();
            await user.save();

            await SubmissionModel.assignCoAuthors(submission.directory, [user.id]);
            await SubmissionModel.assignCoAuthors(submission.directory, [user.id]);
            const resultDoc = await SubmissionModel.findOne({ id: submission.id });

            expect(resultDoc?.coAuthors).to.be.length(1);
        });
    });

    describe ("publish tests", () => {
        it ("throws an error if the submission does not exist", async () => {
            await expectThrowsAsync(SubmissionDoesNotExistError,
                async () => SubmissionModel.publish(v4()));
        });

        it ("throws an error if there are no reviews for the corresponding submission", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            await expectThrowsAsync(SubmissionHasNoReviewsError,
                async () => SubmissionModel.publish(submission.directory));
        });

        it ("throws an error if not all reviews have a corresponding decision made", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const reviewer = generateValidUserModel();
            await reviewer.save();

            const reviews = [createReviewModel(submission, reviewer), createReviewModel(submission, reviewer)];
            for (const review of reviews) {
                await review.save();
            }

            await expectThrowsAsync(ReviewDecisionNotDeterminedError,
                async () => SubmissionModel.publish(submission.directory));
        });

        it ("it sets the given submission to published on success", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const reviewer = generateValidUserModel();
            await reviewer.save();

            const reviews = [createReviewModel(submission, reviewer), createReviewModel(submission, reviewer)]
            reviews.forEach(review => review.status.decision = ReviewDecision.READY);
            for (const review of reviews) {
                await review.save();
            }

            await SubmissionModel.publish(submission.directory);

            const returnedSubmission = await SubmissionModel.findOne({ directory: submission.directory });

            expect(returnedSubmission?.published).to.be.true;
        });
    });

    describe ("incrementVersion tests", () => {
        it ("throws a VersionAlreadyExistsError if the version name specified exists in the list", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const file = createFakeFile() as Express.Multer.File;

            await expectThrowsAsync(VersionAlreadyExistsError,
                async () => submission.incrementVersion(submission.versions[0].version, file));
        });

        it ("appends the version to the front of the list", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();
            const file = createFakeFile() as Express.Multer.File;
            const version = "2.0.0";

            await submission.incrementVersion("2.0.0", file);

            expect(submission.getLatestVersion().version).to.be.eql(version);
        });
    });


    describe ("assertAuthor tests", () => {
        it ("returns true if the author is the same as the ID specified", async () => {
            const author = generateValidUserModel();
            await author.save();

            const submission = generateValidSubmissionModelWithAuthor(author._id);

            await submission.save();
            await submission.populate('author');

            expect(submission.assertAuthor(author.id)).to.be.true;
        });

        it ("returns true if the author is in the list of coAuthors", async () => {
            const author = generateValidUserModel();
            await author.save();

            const submission = generateValidSubmissionModelWithAuthor(author._id);
            const coAuthors = [generateValidUserModel(), generateValidUserModel()];

            for (const author of coAuthors) {
                await author.save();
            }

            submission.coAuthors = coAuthors;

            await submission.save();
            await submission.populate('author');

            expect(submission.assertAuthor(coAuthors[0].id)).to.be.true;
        });

        it ("returns false if the user is not an author", async () => {
            const author = generateValidUserModel();
            await author.save();

            const submission = generateValidSubmissionModelWithAuthor(author._id);
            await submission.save();

            expect(submission.assertAuthor(v4())).to.be.false;
        });
    });

    describe ("getLatestVersion tests", () => {
       it ("returns the latest version (front of the list)", async () => {
           const submission = generateValidSubmissionModel();
           const version = { fileName: 'some-file.eek', version: '2.0.0', directory: v4() } as IVersion;
           submission.versions.unshift(version);
           await submission.save();

           expect(submission.getLatestVersion().version).to.be.eql(version.version);
       });
    });

    describe ("getSubmissionWithVersion tests", () => {
        it ("returns null if the submission exists but the version doesn't", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            expect(await SubmissionModel.getSubmissionWithVersion(submission.directory, v4())).to.be.null;
        });

        it ("returns the version and submission if the version and submission exists", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            expect(SubmissionModel.getSubmissionWithVersion(submission.directory, submission.versions[0].version))
                .to.be.not.null;
        });
    });

    describe ("findPublishedByTitleTests", () => {
        it ("returns only published submissions", async () => {
            const unPublishedSubmissions = [generateValidSubmissionModel(), generateValidSubmissionModel()];
            const publishedSubmissions = [generateValidSubmissionModel(), generateValidSubmissionModel()]
            publishedSubmissions.forEach(s => s.published = true);

            for (const submission of [...unPublishedSubmissions, ...publishedSubmissions]) {
                await submission.save();
            }

            const [numPublished, published] = await SubmissionModel.findPublishedByTitle({
                title: "",
                pageNumber: 1,
                sort: 1
            });

            expect(numPublished).to.be.eql(2);
            expect(published.map(p => p.directory)).to.have.members(publishedSubmissions.map(p => p.directory));
        });

        it ("returns only submissions the author is an author of if the userId is provided", async () => {
            const author = generateValidUserModel();
            await author.save();

            const publishedByAuthor = Array.from({ length: 5 }, () => generatePublicationWithAuthor(author._id));
            const publishedByNonAuthor = Array.from({ length: 5 }, () => generateValidPublicationModel());
            const unPublishedByAuthor = Array.from({ length: 5 }, () => generateValidSubmissionModelWithAuthor(author._id))

            for (const submission of [...publishedByAuthor, ...publishedByNonAuthor, ...unPublishedByAuthor]) {
                await submission.save();
            }

            const [numPublished, published] = await SubmissionModel.findPublishedByTitle({
                title: "",
                pageNumber: 1,
                sort: 1,
                userId: author.id
            });

            expect (numPublished).to.be.eql(5);
            expect(published.map(p => p.directory)).to.be.eql(publishedByAuthor.map(p => p.directory));
        });

        it ("returns submissions the user is a coAuthor of if the userId is provided", async () => {
            const author = generateValidUserModel();
            await author.save();
        });

    });

    describe ("getPublicationTests", () => {
        it ("returns null if the submission does not exist", async () => {
            const result = await SubmissionModel.getPublication(v4());
            expect(result).to.be.null;
        });

        it ("returns null if the submission exists but is not published", async () => {
            const submission = generateValidSubmissionModel();
            submission.published = false

            await submission.save();

            const result = await SubmissionModel.getPublication(submission.directory);
            expect(result).to.be.null;
        });

        it ("returns the publication if the submission exists and it is published", async () => {
            const submission = generateValidSubmissionModel();
            submission.published = true;

            await submission.save();

            const result = await SubmissionModel.getPublication(submission.directory);
            expect(result.directory).to.be.eql(submission.directory);
        });
    });

    describe ("getSubmissionsWithNoReviewers tests", () => {
        it ("returns all submissions with no reviewers", async () => {
            const submissionsWithNoReviewers = [generateValidSubmissionModel(), generateValidSubmissionModel()];
            const submissionsWithReviewers = [generateValidSubmissionModel(), generateValidSubmissionModel()];

            const reviewer = generateValidUserModel();
            await reviewer.save();

            submissionsWithReviewers.map(s => s.reviewers.push(reviewer));
            for (const submission of [...submissionsWithNoReviewers, ...submissionsWithReviewers]) {
                await submission.save();
            }

            const [numSubmissions, results] = await SubmissionModel.getSubmissionsWithNoReviewers(0);
            expect(results.map(s => s.directory)).to.have.members(submissionsWithNoReviewers.map(s => s.directory));

            expect(numSubmissions).to.be.eql(submissionsWithNoReviewers.length);
        });

        it ("returns an empty list if all submissions have reviewers assigned", async () => {
            const submissions = [generateValidSubmissionModel(), generateValidSubmissionModel()];

            const reviewer = generateValidUserModel();
            await reviewer.save();

            submissions.forEach(s => s.reviewers.push(reviewer));
            for (const submission of submissions) {
                await submission.save();
            }

            const [numSubmissions, result] = await SubmissionModel.getSubmissionsWithNoReviewers(0);
            expect(result).to.be.empty;
            expect(numSubmissions).to.be.eql(0);
        });
    });

    describe ("addSupportingDocument tests", async () => {
        it ("adds the supporting document to the submission", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const toAdd = { fileName: faker.random.word(), id: v4() }

            await submission.addSupportingDocument(toAdd.fileName, toAdd.id);
            await submission.save();

            expect(submission.supportingDocuments[0].id).to.be.eql(toAdd.id);
        });
    });

    describe ("getPublicationOfTheDay", async () => {
        it ('gets the publication with the most views', async () => {
            const publications = [generateValidPublicationModel(),
                generateValidPublicationModel(), generateValidPublicationModel()];
            for (const publication of publications) {
                await publication.save();
            }

            publications[0].stats.publishedVisits = 5;
            await publications[0].save();

            const returned = await SubmissionModel.getPublicationOfTheDay();
            expect(returned.directory).to.be.eql(publications[0].directory);
        });
    });

    describe ("getFeaturedSubmissions", () => {
        it ("gets the second most popular submission to the 11th most popular submission", async () => {
            const publications = Array.from({ length: 15 }, () => generateValidPublicationModel());
            publications.forEach((p, index) => p.stats.publishedVisits = index);
            for (const publication of publications) {
                await publication.save();
            }

            const returned = await SubmissionModel.getFeaturedPublications();
            const expectedReturned = publications.reverse().slice(1, Math.min(11, publications.length));

            expect(returned.map(p => p.directory)).to.be.eql(expectedReturned.map(p => p.directory));
        });

    });

    describe ("resetStats", () => {
        it ("resets all published submission visited stats to 0", async () => {
            const publications = Array.from({ length: 15 }, () => generateValidPublicationModel());
            publications.forEach((p, index) => p.stats.publishedVisits = index);
            for (const publication of publications) {
                await publication.save();
            }

            await SubmissionModel.resetStats();

            const returned = await SubmissionModel.find({ published: true });
            expect (returned.every(p => p.stats.publishedVisits === 0)).to.be.true;
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});