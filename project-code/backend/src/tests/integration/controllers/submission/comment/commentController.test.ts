import {COMMENT_ENDPOINT, COMMENT_FILE_ENDPOINT} from "@tests/config/specificationEndpoints";
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
import request from "supertest";
import faker from "faker";
import {v4} from "uuid";
import {ISubmission} from "@models/submission/submissionModel";
import {IReview} from "@models/review/reviewModel";
import {describe} from "mocha";


describe ("commentController tests", () => {
    let app: Express;
    let server: Server;
    let user: IUser;
    let cookie: string;
    let submission: ISubmission;
    let review: IReview;

    before(async () => {
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
        cookie = await getLoginCookie(app, {email: user.email, password: password});

        submission = generateValidSubmissionModelWithAuthor(user._id);
        await submission.save();

        review = createReviewModel(submission, user);
        await review.save();
    });

    describe(`POST ${COMMENT_ENDPOINT}`, async () => {
        it("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(COMMENT_ENDPOINT)
                .send()
                .expect(401);
        });

        it("returns 400 if the review was not defined", async () => {
            await request(app)
                .post(COMMENT_ENDPOINT)
                .send({payload: faker.random.words()});
        });

        it("returns 400 if the payload was not defined", async () => {
            await request(app)
                .post(COMMENT_ENDPOINT)
                .send({reviewId: v4()});
        });

        it("returns 404 if the review does not exist", async () => {
            await request(app)
                .post(COMMENT_ENDPOINT)
                .send({reviewId: v4(), payload: faker.random.words()})
                .set('Cookie', cookie)
                .expect(404);
        });

        it("returns 400 if the parent comment does not exist", async () => {
            await request(app)
                .post(COMMENT_ENDPOINT)
                .send({reviewId: review.reviewId, payload: faker.random.words(), parentId: 2})
                .set('Cookie', cookie)
                .expect(400);
        });
    });

    describe(`POST ${COMMENT_FILE_ENDPOINT}`, async () => {
        it("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .send()
                .expect(401);
        });

        it("returns 400 if the review is not defined", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({payload: faker.random.words(), pathToFile: faker.random.words()})
                .send()
                .expect(400);
        });

        it("returns 400 if the file is not defined", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({payload: faker.random.words(), reviewId: v4()})
                .expect(400);
        });

        it("returns 400 if the payload is not defined", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({pathToFile: faker.random.words(), reviewId: v4()})
                .expect(400);
        });

        it("returns 404 if the review does not exist", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({payload: faker.random.words(), pathToFile: faker.random.words(), reviewId: v4()})
                .expect(404);
        });

        it("returns 400 if the parent comment does not exist", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({
                    payload: faker.random.words(),
                    pathToFile: faker.random.words(),
                    reviewId: review.reviewId,
                    parentId: 200
                })
                .expect(400);
        });

        it("returns 200 if we were able to make the comment", async () => {
            await request(app)
                .post(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({payload: faker.random.words(), pathToFile: faker.random.words(), reviewId: review.reviewId})
                .expect(200);
        });
    });

    describe(`GET ${COMMENT_ENDPOINT}`, async () => {
        it("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(COMMENT_ENDPOINT)
                .send({})
                .expect(401);
        });

        it("returns 404 if the review does not exist", async () => {
            await request(app)
                .get(COMMENT_ENDPOINT)
                .set('Cookie', cookie)
                .query({reviewId: v4()})
                .send()
                .expect(404);
        });

        it("returns 200 on successful retrieval of the comments", async () => {
            await request(app)
                .get(COMMENT_ENDPOINT)
                .set('Cookie', cookie)
                .query({reviewId: review.reviewId})
                .send()
                .expect(200);
        });
    });

    describe(`GET ${COMMENT_FILE_ENDPOINT}`, async () => {
        it("returns 400 if the user is not authorized", async () => {
            await request(app)
                .get(COMMENT_FILE_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the reviewid is not defined", async () => {
            await request(app)
                .get(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .send({ pathToFile: faker.random.words() })
                .expect(400);
        });

        it ("returns 400 if pathToFile is not defined", async () => {
            await request(app)
                .get(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ reviewId: v4() })
                .send()
                .expect(400);
        });

        it("returns 404 if the review does not exist", async () => {
            await request(app)
                .get(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ reviewId: v4(), pathToFile: faker.random.words() })
                .send()
                .expect(404);

        });

        it("returns 200 on successful retrieval of the comments", async () => {
            await request(app)
                .get(COMMENT_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ reviewId: review.reviewId, pathToFile: faker.random.words() })
                .send()
                .expect(200);
        });
    });
});