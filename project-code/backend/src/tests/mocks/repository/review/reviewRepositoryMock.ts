import BaseRepositoryMock from "@mocks/repository/baseRepositoryMock";
import {IReview, IReviewRepository} from "@models/review/reviewModel";
import sinon from "sinon";

export class ReviewRepositoryMock extends BaseRepositoryMock<IReview> implements IReviewRepository {
    createReview = sinon.stub();
    getComments = sinon.stub();
    getGeneralComments = sinon.stub();
    getAndPopulateReviewer = sinon.stub();
    getReviews = sinon.stub();
    countReviewsForUser = sinon.stub();
    getNumCommentsForPath = sinon.stub();
}