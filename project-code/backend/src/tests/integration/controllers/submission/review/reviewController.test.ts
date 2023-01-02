import {describe} from "mocha";
import {Express} from "express";
import Server from "@server/server";
import {IUser} from "@models/user/userModel";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import createTestConfig from "@tests/config/testConfig";
import {
    createReviewModel,
    generateValidSubmissionModelWithAuthor,
    generateValidUserModel
} from "@tests/seed/fakeModels";
import getLoginCookie from "@tests/integration/helper/utilityRequests";
import {REVIEW_DECISION_ENDPOINT, REVIEW_ENDPOINT} from "@tests/config/specificationEndpoints";
import request from "supertest";
import {v4} from "uuid";
import {ReviewDecision} from "@models/review/reviewModel";
import faker from "faker";

describe ("reviewController integration tests", () => {
    let app: Express;
    let server: Server;
    let user: IUser;
    let cookie: string;

    before (async () => {
        await MongoTestDB.startServer();
        server = new Server(createTestConfig(MongoTestDB.getDbUrl()));
        app = server.getApp();
        await server.startMongo();
    });

    after(async () => {
        await MongoTestDB.stopServer();
    });

    beforeEach(async () => {
        await MongoTestDB.clearCollections();

        user = generateValidUserModel();
        const password = user.password;
        await user.save();
        cookie = await getLoginCookie(app, { email: user.email, password: password });
    });

    describe (`POST ${REVIEW_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(REVIEW_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId is not defined", async () => {
            await request(app)
                .post(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .send({})
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            await request(app)
                .post(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .send({ submissionId: v4() })
                .expect(404);
        });

        it ("returns 200 if we were able to post a review to the submission", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            await request(app)
                .post(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .send({ submissionId: submission.directory })
                .expect(200);
        });
    });

    describe (`POST ${REVIEW_DECISION_ENDPOINT}`, () => {
        it ("returns 401 if the user is no authorized", async () => {
            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the reviewId is not defined", async () => {
            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({ decision: ReviewDecision.READY, comment: faker.random.words() })
                .expect(400);
        });

        it ("returns 400 if the decision is not defined", async () => {
            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({ reviewId: v4(), comment: faker.random.words() })
        });

        it ("returns 400 if the comment is not defined", async () => {
            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({ reviewId: v4(), decision: ReviewDecision.READY });
        });

        it ("returns 400 if the decision is undetermined", async () => {
            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({ reviewId: v4(), decision: ReviewDecision.UNDETERMINED, comment: faker.random.words() });
        });

        it ("returns 404 if the review does not exist", async () => {
            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({ reviewId: v4(), decision: ReviewDecision.READY, comment: faker.random.words() });
        });

        it ("returns 401 if the user is not a reviewer", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            const newUser = generateValidUserModel();
            await newUser.save();

            const review = createReviewModel(submission, newUser._id);
            await review.save();

            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({reviewId: review.reviewId, decision: ReviewDecision.READY, comment: faker.random.words() })
                .expect(401);
        });

        it ("returns 200 if we were able to make a decision on the review", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            submission.reviewers.push(user._id);
            await submission.save();
            const review = createReviewModel(submission, user._id);
            await review.save();

            await request(app)
                .post(REVIEW_DECISION_ENDPOINT)
                .set('Cookie', cookie)
                .send({reviewId: review.reviewId, decision: ReviewDecision.READY, comment: faker.random.words() })
                .expect(200);
        });
    });

    describe (`GET ${REVIEW_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .get(REVIEW_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the reviewId is not provided", async () => {
            await request(app)
                .get(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });

        it ("returns 404 if the review could not be found", async () => {
            await request(app)
                .get(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .query({ reviewId: v4() })
                .send()
                .expect(404);
        });

        it ("return 401 if the decision has not been release and the user isnt the owner", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            const reviewer = generateValidUserModel();
            await reviewer.save();
            const review = createReviewModel(submission, reviewer);
            await review.save();

            await request(app)
                .get(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .query({ reviewId: review.reviewId })
                .send()
                .expect(401);
        });

        it ("returns 200 on success", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            const review = createReviewModel(submission, user._id);
            await review.save();

            await request(app)
                .get(REVIEW_ENDPOINT)
                .set('Cookie', cookie)
                .query({ reviewId: review.reviewId })
                .send()
                .expect(200);
        });
    });

});