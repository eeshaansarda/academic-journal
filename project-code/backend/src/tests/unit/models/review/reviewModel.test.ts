import {describe} from "mocha";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {generateApiReviewer, generateValidAPIComment, generateValidAPICommentWithCommenter} from "@tests/seed/fakeData";
import {
    createCommentModel,
    createReviewModel,
    generateValidSubmissionModel,
    generateValidUserModel
} from "@tests/seed/fakeModels";
import {IUser} from "@models/user/userModel";
import {expect} from "chai";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {
    CommenterDoesNotExist,
    EmptyPayload,
    IReview,
    ParentNotFoundError,
    ReviewDecision,
    ReviewerDoesNotExistError,
    ReviewModel
} from "@models/review/reviewModel";
import {ISubmission, SubmissionDoesNotExistError} from "@models/submission/submissionModel";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});


describe ("Review Model Tests", () => {
    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    describe ("createReview Tests", () => {
        it("throws an error is the reviewer does not exist", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();
            const reviewer = generateApiReviewer();

            await expectThrowsAsync(ReviewerDoesNotExistError, async () => ReviewModel.createReview(reviewer, submission.directory));
        });

        it("throws an error if the submission does not exist", async () => {
            const submission = generateValidSubmissionModel();
            const user = generateValidUserModel();
            await user.save();
            const reviewer = generateApiReviewer();
            reviewer.id = user.id;

            await expectThrowsAsync(SubmissionDoesNotExistError, async () => ReviewModel.createReview(reviewer, submission.directory));
        });

        it("creates a new review document", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();
            const user = generateValidUserModel();
            await user.save();

            const reviewer = generateApiReviewer();
            reviewer.id = user.id;

            const review = await ReviewModel.createReview(reviewer, submission.directory);
            await review.populate("owner");

            expect((review.owner as IUser).id).to.be.eql(user.id);
        });
    });

    describe ("addGeneralComment Tests", () => {
        let submission : ISubmission;

        beforeEach(async () => {
            submission = generateValidSubmissionModel();
            await submission.save();
        });

        it("throws an error is the commenter does not exist", async () => {
            const nonExistentAuthor = generateValidUserModel();

            const review = createReviewModel(submission, nonExistentAuthor);
            await review.save();

            const comment = generateValidAPIComment();

            await expectThrowsAsync(CommenterDoesNotExist, async () => review.addGeneralComment(comment));
        });

        it ("throws an error if the comment payload is empty", async () => {
            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPIComment();
            comment.commenter = {
                username: author.username,
                userId: author.id
            };
            comment.payload = "      ";

            await expectThrowsAsync(EmptyPayload, async () => review.addGeneralComment(comment));
        });

        it ("pushes the comment to the model on success", async () => {
            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPIComment();
            comment.commenter = {
                username: author.username,
                userId: author.id
            };

            await review.addGeneralComment(comment);

            expect(review.comments.map(comment => comment.payload)).to.be.eql([comment.payload]);
        });

        it ("throws an error if the parent does not exist", async () => {
            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPICommentWithCommenter(author);
            comment.parentId = -1000;

            await expectThrowsAsync(ParentNotFoundError, async () => review.addGeneralComment(comment));
        });

        it ("sets pathToFile to undefined", async () => {
            const submission = generateValidSubmissionModel();
            await submission.save();

            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPIComment();
            comment.commenter = {
                username: author.username,
                userId: author.id
            };

            await review.addGeneralComment(comment);

            expect(review.comments.map(comment => comment.pathToFile)).to.be.eql([undefined]);
        });
    });

    describe ("addComment Tests", async () => {
        let submission : ISubmission;

        beforeEach(async () => {
            submission = generateValidSubmissionModel();
            await submission.save();
        });

        it ("throws an error if the commenter does not exist", async () => {
            const nonExistentAuthor = generateValidUserModel();

            const review = createReviewModel(submission, nonExistentAuthor);
            await review.save();

            const comment = generateValidAPIComment();

            await expectThrowsAsync(CommenterDoesNotExist, async () => review.addComment(comment));
        });

        it ("throws an error if the comment payload is empty", async () => {
            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPICommentWithCommenter(author);

            comment.payload = "      ";

            await expectThrowsAsync(EmptyPayload, async () => review.addComment(comment));
        });

        it ("throws an error if the parent does not exist", async () => {
            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPICommentWithCommenter(author);
            comment.parentId = -1000;

            await expectThrowsAsync(ParentNotFoundError, async () => review.addComment(comment));
        });

        it ("adds the comment to the review document", async () => {
            const author = generateValidUserModel();
            await author.save();

            const review = createReviewModel(submission, author);
            await review.save();

            const comment = generateValidAPICommentWithCommenter(author);

            await review.addComment(comment);

            const commentAdded = review.comments[0];
            expect([commentAdded.payload, commentAdded.pathToFile, [commentAdded.anchor.start, commentAdded.anchor.end]])
                .to.be.eql([comment.payload, comment.pathToFile, [comment.anchor?.start, comment.anchor?.end]]);
        });
    });

    describe ("getGeneralComments Tests", async () => {
        let submission : ISubmission;
        let reviewer : IUser;
        let review : IReview;

        beforeEach(async () => {
            submission = generateValidSubmissionModel();
            reviewer = generateValidUserModel();
            await submission.save();
            await reviewer.save();

            review = createReviewModel(submission, reviewer);
            await review.save();
        });

        function pushGeneralComments() {
            const generalComments = [createCommentModel(reviewer), createCommentModel(reviewer), createCommentModel(reviewer)];
            generalComments.forEach(comment => comment.pathToFile = undefined);
            generalComments.forEach(comment => review.comments.push(comment));
            return generalComments;
        }

        function pushFileComments() {
            const fileComments = [createCommentModel(reviewer), createCommentModel(reviewer), createCommentModel(reviewer)];
            fileComments.forEach(comment => review.comments.push(comment));
        }

        it ("returns all comments where the pathToFile is undefined", async () => {

            const generalComments = pushGeneralComments();
            pushFileComments();

            await review.save();

            const comments = await ReviewModel.getGeneralComments(review.reviewId);

            expect(comments.map(comment => comment.payload)).to.have.members(generalComments.map(comment => comment.payload));
        });

        it ("populates the commenter property", async () => {
            pushGeneralComments();
            pushFileComments();

            await review.save();

            const comments = await ReviewModel.getGeneralComments(review.reviewId);

            expect(comments.every(comment => (comment.commenter as IUser).id === reviewer.id)).to.be.true;
        });
    });

    describe ("getComments Tests", async () => {
        let submission : ISubmission;
        let reviewer : IUser;
        let review : IReview;

        beforeEach(async () => {
            submission = generateValidSubmissionModel();
            reviewer = generateValidUserModel();
            await submission.save();
            await reviewer.save();

            review = createReviewModel(submission, reviewer);
            await review.save();
        });

        function pushOtherFileComments() {
            const otherFileComments = [createCommentModel(reviewer), createCommentModel(reviewer), createCommentModel(reviewer)];
            otherFileComments.forEach(comment => review.comments.push(comment));
            return otherFileComments;
        }

        function pushTestFileComments(fileName: string) {
            const testFileComments = [createCommentModel(reviewer), createCommentModel(reviewer), createCommentModel(reviewer)];
            testFileComments.forEach(comment => comment.pathToFile = fileName);
            testFileComments.forEach(comment => review.comments.push(comment));
            return testFileComments;
        }

        it ("returns all comments equal to the given pathToFile", async () => {
            const fileName = "test";

            pushOtherFileComments();
            const testFileComments = pushTestFileComments(fileName);

            await review.save();

            const comments = await ReviewModel.getComments(review.reviewId, fileName);
            expect(comments.map(comment => comment.payload)).to.have.members(testFileComments.map(comment => comment.payload));
        });

        it ("populates the commenter property", async () => {
            const fileName = "test";

            const otherComments = [createCommentModel(reviewer), createCommentModel(reviewer), createCommentModel(reviewer)];
            otherComments.forEach(comment => comment.pathToFile = undefined);
            otherComments.forEach(comment => review.comments.push(comment));

            const fileComments = [createCommentModel(reviewer), createCommentModel(reviewer), createCommentModel(reviewer)];
            fileComments.forEach(comment => review.comments.push(comment));

            await review.save();
            const comments = await ReviewModel.getComments(review.reviewId, fileName);

            expect(comments.every(comment => (comment.commenter as IUser).id === reviewer.id)).to.be.true;
        });
    });

    describe ("getReviews Tests", () => {
        let submission : ISubmission;
        let reviewer : IUser;

        beforeEach(async () => {
            submission = generateValidSubmissionModel();
            reviewer = generateValidUserModel();

            await submission.save();
            await reviewer.save();
        })

        it ("returns an empty list if no reviews were found", async () => {
            const [numReviews, reviews] = await ReviewModel.getReviews({ sort: 1, pageNumber: 0 });

            expect(numReviews).to.be.eql(0);
            expect(reviews).to.be.empty;
        });

        it ("returns all reviews with the given decision if decision is provided", async () => {
            const undeterminedReviews = [createReviewModel(submission, reviewer), createReviewModel(submission, reviewer),
                createReviewModel(submission, reviewer)];

            const readyReviews = [createReviewModel(submission, reviewer), createReviewModel(submission, reviewer)];
            readyReviews.forEach(review => review.status.decision = ReviewDecision.READY);

            for (const review of [...undeterminedReviews, ...readyReviews]) {
                await review.save();
            }

            const [numReviews, reviews] = await ReviewModel.getReviews({ pageNumber: 0, sort: 1, decision: ReviewDecision.READY });

            expect(numReviews).to.be.eql(readyReviews.length);
            expect(reviews.map(review => review.reviewId)).to.have.members(readyReviews.map(review => review.reviewId));
        });

        it ("returns all reviews of the given submission", async () => {
            const anotherSubmission = generateValidSubmissionModel();
            await anotherSubmission.save();

            const reviewForSubmission = [createReviewModel(submission, reviewer), createReviewModel(submission, reviewer)];
            const reviewForAnotherSubmission = [createReviewModel(anotherSubmission, reviewer)];

            for (const review of [...reviewForSubmission, ...reviewForAnotherSubmission]) {
                await review.save();
            }

            const [numReviews, reviews] = await ReviewModel.getReviews({ pageNumber: 0, sort: 1, submissionId: anotherSubmission.directory });

            expect(numReviews).to.be.eql(reviewForAnotherSubmission.length)
            expect(reviews.map(review => review.reviewId)).to.have.members(reviewForAnotherSubmission.map(review => review.reviewId));
        });

        it ("returns all reviews by the given reviewer if the reviewer is provided", async () => {
            const anotherReviewer = generateValidUserModel();
            await anotherReviewer.save();

            const reviewerReviews = [createReviewModel(submission, reviewer), createReviewModel(submission, reviewer)];
            const anotherReviewerReviews = [createReviewModel(submission, anotherReviewer), createReviewModel(submission, anotherReviewer)];

            for (const review of [...reviewerReviews, ...anotherReviewerReviews]) {
                await review.save();
            }

            const [numReviews, reviews] = await ReviewModel.getReviews({ pageNumber: 0, sort: 1, reviewerId: anotherReviewer.id });

            expect(numReviews).to.be.eql(reviewerReviews.length);
            expect(reviews.map(review => review.reviewId)).to.have.members(anotherReviewerReviews.map(review => review.reviewId));
        });

        it ("returns all reviews when the page size is less than the total number of reviews", async () => {
            const reviews = [createReviewModel(submission,reviewer), createReviewModel(submission, reviewer)];

            for (const review of reviews) {
                await review.save();
            }

            const [numReviews, reviewsResult] = await ReviewModel.getReviews({ pageNumber: 0, sort: 1 });

            expect(numReviews).to.be.eql(reviews.length);
            expect(reviewsResult.map(review => review.reviewId)).to.have.members(reviews.map(review => review.reviewId));
        });

        it ("returns a number of reviews given by the page size when there are more reviews than the page size", async () => {
            const reviews = [createReviewModel(submission,reviewer), createReviewModel(submission, reviewer),
            createReviewModel(submission, reviewer)];

            for (const review of reviews) {
                await review.save();
            }

            const [numReviews, reviewsResult] = await ReviewModel.getReviews({ pageNumber: 0, sort: 1, pageSize: 2 });

            expect(numReviews).to.be.eql(reviews.length);
            expect(reviewsResult.map(review => review.reviewId)).to.have.members(reviews.map(review => review.reviewId).slice(0, 2));
        });

        it ("returns the last page of the review", async () => {
            const reviews = [
                createReviewModel(submission,reviewer), 
                createReviewModel(submission, reviewer),
                createReviewModel(submission, reviewer)
            ];

            for (const review of reviews) {
                await review.save();
            }

            const [numReviews, reviewsResult] = await ReviewModel.getReviews({ pageNumber: 2, sort: 1, pageSize: 2 });

            expect(numReviews).to.be.eql(reviews.length);
            expect(reviewsResult.map(review => review.reviewId)).to.have.members(reviews.map(review => review.reviewId).slice(-1));
        });
    });

    describe ("isDecision released tests", () => {
        it ("returns false when the review status is not undetermined", async () => {
            const submission = generateValidSubmissionModel();
            const owner = generateValidUserModel();

            const review = createReviewModel(submission, owner);
            review.status.decision = ReviewDecision.READY;

            expect (review.isDecisionReleased()).to.be.true;
        });

        it ("returns true when the review status is undetermined", async () => {
            const submission = generateValidSubmissionModel();
            const owner = generateValidUserModel();

            const review = createReviewModel(submission, owner);

            expect (review.isDecisionReleased()).to.be.false;
        });
    });

    describe ("getNumCommentsForPath tests", () => {
        let submission: ISubmission;
        let owner: IUser;
        let review: IReview;

        beforeEach(async () => {
            submission = generateValidSubmissionModel();
            await submission.save();
            owner = generateValidUserModel();
            await owner.save();

            review = createReviewModel(submission, owner);
            await review.save();
        })

        it ("returns 0 when there are no comments for the given path", async () => {
            expect(await ReviewModel.getNumCommentsForPath(submission, review.reviewId, "/")).to.be.eql(0);
        });

        it ("returns the number of comments in the given directory if there are comments", async () => {
            const comment1 = createCommentModel(owner);
            comment1.pathToFile = "/"

            const comment2 = createCommentModel(owner);
            comment2.pathToFile = "/some/more/path/text.txt";

            review.comments.push(comment1, comment2);
            await review.save();

            expect(await ReviewModel.getNumCommentsForPath(submission, review.reviewId, "/")).to.be.eql(2);
        });

        it ("returns the number of comments in the given directory if there are comments and comments in parent directories", async () => {
            const comment1 = createCommentModel(owner);
            comment1.pathToFile = "/"

            const comment2 = createCommentModel(owner);
            comment2.pathToFile = "some/more/path/text.txt";

            review.comments.push(comment1, comment2);
            await review.save();

            expect(await ReviewModel.getNumCommentsForPath(submission, review.reviewId, "/some/more")).to.be.eql(1);
        });
    })
});