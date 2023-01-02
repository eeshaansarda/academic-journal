import {describe} from "mocha";
import ReviewsController from "@controllers/api/submission/review/reviewsController";
import {ReviewRepositoryMock} from "@mocks/repository/review/reviewRepositoryMock";
import {createSessionUser} from "@tests/seed/fakeData";
import {expect} from "chai";
import {createReviewModel, generateValidSubmissionModel, generateValidUserModel} from "@tests/seed/fakeModels";
import { ApiReview } from "@server/validation/body/apiReview";

describe ("Reviews Controller Tests", () => {
    let reviewsController: ReviewsController;
    let mockReviewRepository: ReviewRepositoryMock;

    beforeEach(() => {
        reviewsController = new ReviewsController();
        reviewsController.reviewModel = mockReviewRepository = new ReviewRepositoryMock();
    });

    describe ("getMyReviews", () => {
        it ("returns an empty list if no reviews were returned", async () => {
            const sessionUser = createSessionUser();

            mockReviewRepository.getReviews.returns([0, []]);

            const result = await reviewsController.getMyReviews(sessionUser, { sort: 1, pageNumber: 0 });
            expect(result).to.be.eql({
                status: "success",
                reviews: [],
                numReviews: 0
            });
        });

        it ("returns reviews if reviews were returned", async () => {
            const sessionUser = createSessionUser();

            const submission = generateValidSubmissionModel();
            const user = generateValidUserModel();

            const reviews = [createReviewModel(submission, user), createReviewModel(submission, user)];
            mockReviewRepository.getReviews.returns([reviews.length, reviews]);

            const result = await reviewsController.getMyReviews(sessionUser, { sort: 1, pageNumber: 0});
            expect(result).to.be.eql({
                status: "success",
                reviews: reviews.map(review => ApiReview.createApiReviewFromDocument(review)),
                numReviews: reviews.length
            });
        });
    });
});