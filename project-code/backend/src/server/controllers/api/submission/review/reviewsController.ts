import {Authorized, CurrentUser, Get, JsonController, QueryParams} from "routing-controllers";
import {GetReviewsQuery} from "@validation/query/getReviewsQuery";
import {SessionUser} from "@validation/session/SessionUser";
import {IReviewRepository, ReviewModel} from "@models/review/reviewModel";
import {ApiReview} from "@validation/body/apiReview";
import {Service} from "typedi";

@JsonController("/reviews")
@Service()
export default class ReviewsController {
    public static readonly GET_SESSION_USER_REVIEWS = "/my_reviews";

    public reviewModel: IReviewRepository = ReviewModel;

    /**
     * Endpoint for a user to get a list of their reviews.
     * @param currentUser The user who made the request.
     * @param getReviews The query paremeters.
     */
    @Get(ReviewsController.GET_SESSION_USER_REVIEWS)
    @Authorized()
    public async getMyReviews(@CurrentUser({ required: true }) currentUser: SessionUser,
                              @QueryParams() getReviews: GetReviewsQuery) {
        const DEFAULT_PAGE_SIZE = 10;

        const [numReviews, reviews] = await this.reviewModel.getReviews({
            pageSize:  DEFAULT_PAGE_SIZE,
            decision: getReviews.decision,
            sort: getReviews.sort,
            reviewerId: currentUser.id,
            pageNumber: getReviews.pageNumber
        });

        const apiReviews = reviews.map(review => ApiReview.createApiReviewFromDocument(review));

        return {
            status: "success",
            reviews: apiReviews,
            numReviews: numReviews
        };
    }
}