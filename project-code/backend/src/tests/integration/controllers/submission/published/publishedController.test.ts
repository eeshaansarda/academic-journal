import {describe} from "mocha";
import {Express} from "express";
import Server from "@server/server";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import createTestConfig from "@tests/config/testConfig";
import request from "supertest";
import {
    FEATURED_SUBMISSIONS_ENDPOINT, GET_PUBLICATION_ENDPOINT, MY_PUBLICATIONS_ENDPOINT,
    PUBLISHED_SUBMISSIONS_ENDPOINT,
    SUBMISSION_OF_THE_DAY_ENDPOINT
} from "@tests/config/specificationEndpoints";
import {ISubmission, SubmissionModel} from "@models/submission/submissionModel";
import {
    generateValidSubmissionModelWithAuthor,
    generateValidUserModel
} from "@tests/seed/fakeModels";
import getLoginCookie from "@tests/integration/helper/utilityRequests";
import {IUser} from "@models/user/userModel";
import {expect} from "chai";
import {v4} from "uuid";

describe ("publishedController", () => {
    let app: Express;
    let server: Server;
    let cookie: string;
    let user: IUser;
    let published: ISubmission;

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

        published = generateValidSubmissionModelWithAuthor(user._id);
        published.published = true;
        await published.save();
    });

    describe ("featuredSubmissions tests", () => {
        it ("returns 200 on empty", async () => {
            await SubmissionModel.deleteMany({});

            const { body } = await request(app)
                .get(FEATURED_SUBMISSIONS_ENDPOINT)
                .send()
                .expect(200);

            expect (body.publications).to.be.empty;
        });

        it ("returns 200 on populated list", async () => {
            const secondPublished = generateValidSubmissionModelWithAuthor(user._id);
            secondPublished.published = true;

            await secondPublished.save();
            await published.save();

            const { body } = await request(app)
                .get(FEATURED_SUBMISSIONS_ENDPOINT)
                .send()
                .expect(200);

            expect (body.publications).to.not.be.empty;
        });
    });

    describe (`GET ${SUBMISSION_OF_THE_DAY_ENDPOINT}`, () => {
        it ("returns 404 if there are no submissions", async () => {
            await SubmissionModel.deleteMany({});

            await request(app)
                .get(SUBMISSION_OF_THE_DAY_ENDPOINT)
                .send()
                .expect(404);
        });

        it ("returns 200 if there is a submission", async () => {
            const { body } = await request(app)
                .get(SUBMISSION_OF_THE_DAY_ENDPOINT)
                .send()
                .expect(200);

            expect(body.published).to.not.be.null;
        });
    });

    describe (`GET ${PUBLISHED_SUBMISSIONS_ENDPOINT}`, () => {
        it ("returns 400 if pageNumber is less than 0", async () => {
            await request(app)
                .get(PUBLISHED_SUBMISSIONS_ENDPOINT)
                .query({ pageNumber: -1, sort: 1 })
                .send()
                .expect(400);
        });

        it ("returns 400 if sort is not defined", async () => {
            await request(app)
                .get(PUBLISHED_SUBMISSIONS_ENDPOINT)
                .query({ pageNumber: 1 })
                .send()
                .expect(400)
        });

        it ("returns 400 if sort is not 1 or -1", async () => {
            await request(app)
                .get(PUBLISHED_SUBMISSIONS_ENDPOINT)
                .query({ pageNumber: 1, sort: -2 })
                .send()
                .expect(400);
        });

        it ("returns 200 upon success", async () => {
            await request(app)
                .get(PUBLISHED_SUBMISSIONS_ENDPOINT)
                .query({ pageNumber: 1, sort: -1 })
                .send()
                .expect(200);
        });
    });

    describe (`GET ${MY_PUBLICATIONS_ENDPOINT}`, () => {
        it ("returns 401 if the user is unauthorized", async () => {
            await request(app)
                .get(MY_PUBLICATIONS_ENDPOINT)
                .query( {  })
                .send()
                .expect(401);
        });

        it ("returns 400 if pageNumber is less than 0", async () => {
            await request(app)
                .get(MY_PUBLICATIONS_ENDPOINT)
                .set('Cookie', cookie)
                .query({ pageNumber: -1, sort: 1 })
                .send()
                .expect(400);
        });

        it ("returns 400 if sort is not defined", async () => {
            await request(app)
                .get(MY_PUBLICATIONS_ENDPOINT)
                .set('Cookie', cookie)
                .query({ pageNumber: 1 })
                .send()
                .expect(400)
        });

        it ("returns 400 if sort is not 1 or -1", async () => {
            await request(app)
                .get(MY_PUBLICATIONS_ENDPOINT)
                .set('Cookie', cookie)
                .query({ pageNumber: 1, sort: -2 })
                .send()
                .expect(400);
        });

        it ("returns 200 upon success", async () => {
            await request(app)
                .get(MY_PUBLICATIONS_ENDPOINT)
                .set('Cookie', cookie)
                .query({ pageNumber: 1, sort: -1 })
                .send()
                .expect(200);
        });
    });

    describe (`GET ${GET_PUBLICATION_ENDPOINT}`,  () => {
        it ("returns 404 if the publication does not exist", async () => {
            await request(app)
                .get(GET_PUBLICATION_ENDPOINT)
                .query({ publicationId: v4() })
                .send()
                .expect(404);
        });

        it ("returns 400 if the publicationId is not defined", async () => {
            await request(app)
                .get(GET_PUBLICATION_ENDPOINT)
                .query({ })
                .send()
                .expect(404);
        });

        it ("returns 200 if the publication exists", async () => {
            await request(app)
                .get(GET_PUBLICATION_ENDPOINT)
                .query({ publicationId: published.directory })
                .send()
                .expect(404);
        });
    });

    afterEach(async () => {
        await MongoTestDB.clearCollections();
    });
});