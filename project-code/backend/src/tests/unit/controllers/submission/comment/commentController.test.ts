import {describe} from "mocha";
import sinon from "sinon";
import CommentController from "@controllers/api/submission/comment/commentController";
import {
    createSessionUser, generateCommentBody, generateFakeComment,
    generateGeneralCommentBody, generateGetFileCommentsQuery,
    generateGetGeneralCommentsQuery, generateReview
} from "@tests/seed/fakeData";
import {expect} from "chai";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError} from "routing-controllers";
import {ApiComment} from "@validation/body/apiComments";
import {ReviewRepositoryMock} from "@mocks/repository/review/reviewRepositoryMock";
import {IComment} from "@models/comment/commentModel";

describe("CommentController Tests", () => {
    let commentController: CommentController;
    let reviewRepositoryMock: ReviewRepositoryMock;

    beforeEach(() => {
        commentController = new CommentController();
        commentController.reviewModel = reviewRepositoryMock = new ReviewRepositoryMock();
    });

    describe("comment endpoint tests", () => {
        it("throws an error if we could not add a comment", () => {
            const user = createSessionUser();
            const generalComment = generateGeneralCommentBody();
            const review = generateReview();

            reviewRepositoryMock.getOne.returns(review);
            review.addGeneralComment.throws(new Error("something bad here"));

            expectThrowsAsync(BadRequestError,
                async () => await commentController.comment(user, generalComment))
        });

        it("returns success if we could successfully create a comment", async () => {
            const user = createSessionUser();
            const generalComment = generateGeneralCommentBody();
            const review = generateReview();
            reviewRepositoryMock.getOne.returns(review);

            const result = await commentController.comment(user, generalComment);

            expect(result).to.be.eql({
                status: "success"
            });
        });
    });

    describe("Comment File endpoint tests", async () => {
        it("throws an error if we could not add a comment", () => {
            const user = createSessionUser();
            const apiComment = generateCommentBody();
            const review = generateReview();

            review.addComment.throws(new Error("something bad here"));

            expectThrowsAsync(BadRequestError,
                async () => await commentController.commentFile(user, apiComment));
        });

        it("returns success if we could successfully create a comment", async () => {
            const user = createSessionUser();
            const apiComment = generateCommentBody();
            const review = generateReview();
            reviewRepositoryMock.getOne.returns(review);

            const result = await commentController.commentFile(user, apiComment);

            expect(result).to.be.eql({
                status: "success"
            });
        });
    });

    describe("Get General Comments Endpoint Tests", () => {
        it("If no comments were found it returns an empty list", async () => {
            const commentQuery = generateGetGeneralCommentsQuery();
            reviewRepositoryMock.docExists.returns(true);
            reviewRepositoryMock.getGeneralComments.returns([]);

            const response = await commentController.getGeneralComments(commentQuery);

            expect(response).to.be.eql({
                status: "success",
                comments: []
            });
        });

        it("If comments were returned it returns the comments", async () => {
            const commentQuery = generateGetGeneralCommentsQuery();
            const returnedComments = [generateFakeComment(), generateFakeComment(), generateFakeComment()];
            reviewRepositoryMock.docExists.returns(true);
            reviewRepositoryMock.getGeneralComments.returns(returnedComments);

            const response = await commentController.getGeneralComments(commentQuery);

            expect(response).to.be.eql({
                status: "success",
                comments: returnedComments.map(comment => ApiComment.createApiCommentFromDocument(comment as any as IComment, commentQuery.reviewId))
            });
        });
    });

    describe("Get Comments For File Endpoint Tests", () => {
        it("If no comments were found it returns an empty list", async () => {
            const commentQuery = generateGetFileCommentsQuery();
            reviewRepositoryMock.docExists.returns(true);
            reviewRepositoryMock.getComments.returns([]);

            const response = await commentController.getCommentsForFile(commentQuery);

            expect(response).to.be.eql({
                status: "success",
                comments: []
            });
        });

        it("If comments were returned it returns the comments", async () => {
            const commentQuery = generateGetFileCommentsQuery();
            const returnedComments = [generateFakeComment(), generateFakeComment(), generateFakeComment()];
            reviewRepositoryMock.docExists.returns(true);
            reviewRepositoryMock.getComments.returns(returnedComments);

            const response = await commentController.getCommentsForFile(commentQuery);

            expect(response).to.be.eql({
                status: "success",
                comments: returnedComments.map(comment => ApiComment.createApiCommentFromDocument(comment as any as IComment, commentQuery.reviewId))
            });
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});
