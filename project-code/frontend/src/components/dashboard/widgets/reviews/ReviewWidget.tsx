import {useEffect, useState} from "react";
import {Review} from "@responses/review";
import {ReviewService} from "@services/reviewService/reviewService";
import {v4} from "uuid";
import InfiniteScroll from "react-infinite-scroller";
import ReviewSummary from "@components/submission/review/ReviewSummary";
import NoReviews from "@components/submission/review/noReview/NoReviews";

/**
 * Widget for showing a list of reviews in the system.
 * Uses infinite scrolling to display all reviews
 */
export default function ReviewWidget() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [numReviews, setNumReviews] = useState(0);

    const [uniqueId] = useState(v4());
    const reviewsService = new ReviewService();

    function getMyReviews (pageNumber: number) {
        reviewsService.getMyReviews(pageNumber).then(res => {
            if (res.data && res.data.status === "success") {
                setReviews([...reviews, ...res.data.reviews]);
                setNumReviews(res.data.numReviews);
            }
        });
    }

    useEffect(() => {
        getMyReviews(1);
    }, []);

    return (
        <div style={{overflowY: 'auto'}} id={`review-widget-${uniqueId}`}>
            <div className="d-flex justify-content-center">
                <InfiniteScroll
                    pageStart={1}
                    loadMore={getMyReviews}
                    hasMore={numReviews !== reviews.length}
                    useWindow={false}
                    getScrollParent={() => document.getElementById(`review-widget-${uniqueId}`)} >
                    { reviews.length > 0 ? reviews.map(review =>
                        <ReviewSummary key={review.reviewId} review={review} submissionId={review.submissionId} />) : <NoReviews />}
                </InfiniteScroll>
            </div>
        </div>
    )

}