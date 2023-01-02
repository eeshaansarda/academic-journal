import {describe} from "mocha";
import {
    createApiPostReview,
    createSessionUser,
    generateApiReviewVerdict,
    generateReview,
    generateUser
} from "@tests/seed/fakeData";
import ReviewController from "@controllers/api/submission/review/reviewController";
import {ReviewRepositoryMock} from "@mocks/repository/review/reviewRepositoryMock";
import sinon from "sinon";
import {v4 as uuidv4} from "uuid";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, NotFoundError, UnauthorizedError} from "routing-controllers";
import {expect} from "chai";
import {ReviewDecision} from "@models/review/reviewModel";
import {SessionUser} from "@validation/session/SessionUser";
import {IUser} from "@models/user/userModel";

describe("Review Controller Tests", () => {
    let reviewController: ReviewController;
    let mockReviewRepository: ReviewRepositoryMock;

    beforeEach(() => {
        reviewController = new ReviewController();
        reviewController.reviewModel = mockReviewRepository = new ReviewRepositoryMock();
    });

    describe ("postReview endpoint tests", () => {
        it("throws an error if we were unable to create a review", async () => {
            const session = createSessionUser();
            const body = createApiPostReview();

            mockReviewRepository.createReview.throws(BadRequestError);

            await expectThrowsAsync(BadRequestError,
                async () => await reviewController.postReview(session, body));
        });

        it("returns success if we were able to create a review", async () => {
            const user = createSessionUser();
            const body = createApiPostReview();

            const review = generateReview();

            mockReviewRepository.createReview.returns(review);

            const result = await reviewController.postReview(user, body);

            expect(result).to.be.eql({
                status: "success",
                reviewId: review.reviewId
            });
        });
    });

    describe ("postDecision endpoint tests", () => {
        it ("throws a NotFoundError if the review does not exist", async () => {
            const user = createSessionUser();
            const verdict = generateApiReviewVerdict();

            mockReviewRepository.getAndPopulateReviewer.returns(null);

            await expectThrowsAsync(NotFoundError,
                async () => reviewController.postDecision(user, verdict));
        });

        it ("throws an unauthorized error if the author does not match the user", async () => {
            const user = createSessionUser();
            const verdict = generateApiReviewVerdict();
            const reviewToReturn = generateReview();
            reviewToReturn.owner.id = "some-non-id";

            mockReviewRepository.getAndPopulateReviewer.returns(reviewToReturn);

            await expectThrowsAsync(UnauthorizedError,
                async () => reviewController.postDecision(user, verdict));
        });

        it ("changes the status of the mongoose model", async () => {
            const user = createSessionUser();
            const verdict = generateApiReviewVerdict();
            const reviewToReturn = generateReview();
            reviewToReturn.owner.id = user.id;

            mockReviewRepository.getAndPopulateReviewer.returns(reviewToReturn);

            const result = await reviewController.postDecision(user, verdict);

            expect(result.status).to.be.eql("success");
            expect(reviewToReturn.status).to.be.eql({
                decision: verdict.decision,
                verdict: verdict.comment
            });
        });

        it ("throws an error if the user posts an undetermined decision", async () => {
            const user = createSessionUser();
            const verdict = generateApiReviewVerdict();
            verdict.decision = ReviewDecision.UNDETERMINED;

            await expectThrowsAsync(BadRequestError, async () => reviewController.postDecision(user, verdict));
        });
    });

    describe ("getReview tests", () => {
        let sessionUser : SessionUser;

        beforeEach(() => {
            sessionUser = createSessionUser();
        })

        it ("throws NotFoundError if the review does not exist", async () => {
            mockReviewRepository.getAndPopulateReviewer.returns(null);
            await expectThrowsAsync(NotFoundError, async () => reviewController.getReview(sessionUser, uuidv4()))
        });

        it ("throws UnauthorizedError if the review has not yet been released and the user is not the owner", async () => {
            const review = generateReview();
            mockReviewRepository.getAndPopulateReviewer.returns(review);
            await expectThrowsAsync(UnauthorizedError, async () => reviewController.getReview(sessionUser, review.reviewId));
        });

        it ("returns success if the review has not yet been released but the owner is the current session user", async () => {
            const review = generateReview();
            const user = generateUser();
            sessionUser.id = user.id as string;
            review.owner = user as IUser;

            mockReviewRepository.getAndPopulateReviewer.returns(review);

            const result = await reviewController.getReview(sessionUser, review.reviewId);

            expect(result.status).to.be.eql("success");
        });

        it ("returns success if the review has been released", async () => {
            const review = generateReview();
            review.status.decision = ReviewDecision.READY;

            mockReviewRepository.getAndPopulateReviewer.returns(review);

            const result = await reviewController.getReview(sessionUser, review.reviewId);

            expect(result.status).to.be.eql("success");
        });
    });

    afterEach(() => {
       sinon.restore();
    });
});