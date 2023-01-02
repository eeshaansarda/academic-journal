import {describe} from "mocha";
import SubmissionController from "@controllers/api/submission/submissionController";
import request from "supertest";
import Server from "@server/server";
import {Express} from "express";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import createTestConfig from "@tests/config/testConfig";
import {
    generateUserModelWithRole,
    generateValidSubmissionModelWithAuthor,
    generateValidUserModel
} from "@tests/seed/fakeModels";
import getLoginCookie from "@tests/integration/helper/utilityRequests";
import {
    ASSIGN_CO_AUTHORS,
    ASSIGN_REVIEWERS, DELETE_SUBMISSION,
    DOWNLOAD_ENDPOINT,
    EXPORT_ENDPOINT,
    GET_FILE_ENDPOINT,
    GET_REVIEWS,
    GET_SUBMISSION_METADATA, GET_VERSIONS, PUBLISH_SUBMISSION,
    UPLOAD_ENDPOINT
} from "@tests/config/specificationEndpoints";
import {v4} from "uuid";
import faker from "faker";
import {IUser, UserRole} from "@models/user/userModel";
import {expect} from "chai";

describe('Submission Controller Integration Tests',  () => {
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

    describe (`POST ${SubmissionController.UPLOAD_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(UPLOAD_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if no submission is provided", async () => {
            await request(app)
                .post(UPLOAD_ENDPOINT)
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });
    });

    describe (`GET ${DOWNLOAD_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .get(DOWNLOAD_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId is not provided", async () => {
            await request(app)
                .get(DOWNLOAD_ENDPOINT)
                .set('Cookie', cookie)
                .send({})
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            await request(app)
                .get(`${DOWNLOAD_ENDPOINT}?submissionId=${v4()}`)
                .set('Cookie', cookie)
                .send()
                .expect(404);
        });
    });

    describe (`POST ${EXPORT_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(EXPORT_ENDPOINT)
                .send({})
                .expect(401);
        });

        it ("returns 400 if the id not defined", async () => {
            await request(app)
                .post(EXPORT_ENDPOINT)
                .set('Cookie', cookie)
                .send( { url: faker.internet.url() })
                .expect(400);
        });

        it ("returns 400 if the url is not defined", async () => {
            await request(app)
                .post(EXPORT_ENDPOINT)
                .set('Cookie', cookie)
                .send( { id: v4() })
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            await request(app)
                .post(EXPORT_ENDPOINT)
                .set('Cookie', cookie)
                .send({ id: v4() })
                .expect(400);
        });
    });

    describe (`GET ${GET_FILE_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .send({})
                .expect(401);
        });

        it ("returns 400 if the submissionId is not specified", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ pathToFile: '/some/path/to/file' })
                .send()
                .expect(400);
        });

        it ("returns 400 if the pathToFile is not specified", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ submissionId: v4() })
                .send()
                .expect(400);
        });
    });

    describe (`GET ${GET_FILE_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId is not defined", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ pathToFile: "/some/path" })
                .send()
                .expect(400);
        });

        it ("returns 400 if the path to file is not defined", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ submissionId: v4() })
                .send()
                .expect(400);
        });

        it ("returns 404 if the submission is not defined", async () => {
            await request(app)
                .get(GET_FILE_ENDPOINT)
                .set('Cookie', cookie)
                .query({ submissionId: v4(), pathToFile: '/some/path/to/file' })
                .send()
                .expect(404);
        });
    });

    describe (`GET ${GET_SUBMISSION_METADATA}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .get(GET_SUBMISSION_METADATA)
                .send()
                .expect(401);
        });

        it ("returns 404 if the submission does not exist", async () => {
            await request(app)
                .get(GET_SUBMISSION_METADATA)
                .query({ submissionId: v4() })
                .set('Cookie', cookie)
                .send()
                .expect(404);
        });

        it ("it returns the submission metadata if it exists", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            const { body } = await request(app)
                .get(GET_SUBMISSION_METADATA)
                .query({ submissionId: submission.directory })
                .set('Cookie', cookie)
                .send()

            expect(body.submission.submissionId).to.be.eql(submission.directory);
        });
    });

    describe (`GET ${GET_REVIEWS}`, () => {
        it ("returns 400 if the user is not authorized", async () => {
            await request(app)
                .get(GET_REVIEWS)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId is not defined", async () => {
            await request(app)
                .get(GET_REVIEWS)
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            await request(app)
                .get(GET_REVIEWS)
                .set('Cookie', cookie)
                .query({ submissionId: v4() })
                .send()
                .expect(404);
        });

        it ("returns 200 if the submission exists", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            await request(app)
                .get(GET_REVIEWS)
                .set('Cookie', cookie)
                .query({ submissionId: submission.directory })
                .send()
                .expect(200);
        });
    });

    describe(`PUT ${ASSIGN_REVIEWERS}`, () => {
        let editor: IUser;
        let editorCookie: string;

        beforeEach(async () => {
            editor = generateUserModelWithRole(UserRole.EDITOR);
            const password = editor.password;
            await editor.save();

            editorCookie = await getLoginCookie(app, { email: editor.email, password });
        });

        it ("returns 403 if the user is not authorized", async () => {
            await request(app)
                .put(ASSIGN_REVIEWERS)
                .send()
                .expect(403);
        });

        it ("returns 401 if the user is not an editor", async () => {
            await request(app)
                .put(ASSIGN_REVIEWERS)
                .send()
                .set('Cookie', cookie)
                .expect(403);
        });

        it ("returns 404 if a given user does not exist", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            await request(app)
                .put(ASSIGN_REVIEWERS)
                .set('Cookie', editorCookie)
                .send({ submissionId: submission.directory, reviewers: [v4()] })
                .expect(404);
        });

        it ("returns 404 if the submission does not exist", async () => {
            await request(app)
                .put(ASSIGN_REVIEWERS)
                .set('Cookie', editorCookie)
                .send({ submissionId: v4(), reviewers: [user.id] })
                .expect(404);
        });

        it ("returns 200 if we were able to assign authors", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            await request(app)
                .put(ASSIGN_REVIEWERS)
                .set('Cookie', editorCookie)
                .send({ submissionId: submission.directory, reviewers: [editor.id, user.id] })
                .expect(200);
        });
    });

    describe (`PUT ${ASSIGN_CO_AUTHORS}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .put(ASSIGN_CO_AUTHORS)
                .send()
                .expect(401);
        });

        it ("returns 401 if the user is not the author of the submission", async () => {
            const newUser = generateValidUserModel();
            await user.save();

            const submission = generateValidSubmissionModelWithAuthor(newUser._id);
            await submission.save();

            await request(app)
                .put(ASSIGN_CO_AUTHORS)
                .set('Cookie', cookie)
                .send({ submissionId: submission.directory, userIds: [user.id] })
        });

        it ("returns 400 if the submissionId is not defined", async () => {
            await request(app)
                .put(ASSIGN_CO_AUTHORS)
                .set('Cookie', cookie)
                .send({ userIds: [user.id] });
        });

        it ("returns 400 if the userIds property is not defined", async () => {
            await request(app)
                .put(ASSIGN_CO_AUTHORS)
                .set('Cookie', cookie)
                .send({ submissionId: v4() });
        });

        it ("returns 200 if we were able to assign coAuthors to a submission", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            const newUser = generateValidUserModel();
            await newUser.save();

            await request(app)
                .put(ASSIGN_CO_AUTHORS)
                .set('Cookie', cookie)
                .send({ submissionId: submission.directory, userIds: [newUser.id] });
        });
    });

    describe (`PUT ${PUBLISH_SUBMISSION}`, () => {
        let editor: IUser;
        let editorCookie: string;

        beforeEach(async () => {
            editor = generateUserModelWithRole(UserRole.EDITOR);
            const password = editor.password;
            await editor.save();

            editorCookie = await getLoginCookie(app, { email: editor.email, password });
        });

        it ("returns 403 if the user is not authorized", async () => {
            request(app)
                .put(PUBLISH_SUBMISSION)
                .send()
                .expect(403);
        });

        it ("returns 403 if the user is not an editor", async () => {
            request(app)
                .put(PUBLISH_SUBMISSION)
                .set('Cookie', cookie)
                .send()
                .expect(403);
        });

        it ("returns 400 if we did not provide a submission id", async () => {
            request(app)
                .put(PUBLISH_SUBMISSION)
                .set('Cookie', editorCookie)
                .send({  })
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            request(app)
                .put(PUBLISH_SUBMISSION)
                .set('Cookie', editorCookie)
                .send({ submissionId: v4() })
                .expect(404);
        });

        it ("returns 200 if we could publish the submission", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            request(app)
                .put(PUBLISH_SUBMISSION)
                .set('Cookie', editorCookie)
                .send({ submissionId: submission.directory })
                .expect(200);
        });
    });

    describe ("getVersions endpoint", () => {
        it ("returns 401 if the user is not authorized", async () => {
            request(app)
                .get(GET_VERSIONS)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId was not specified", async () => {
            request(app)
                .get(GET_VERSIONS)
                .set('Cookie', cookie)
                .send({})
                .expect(400);
        });

        it ("returns 200 if the user is authorized", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            request(app)
                .get(GET_VERSIONS)
                .set('Cookie', cookie)
                .send({ submissionId: submission.directory })
                .expect(200);
        });
    });

    describe ("deleteSubmission endpoint", () => {
        it ("returns 401 if the user is not authorized", async () => {
            request(app)
                .delete(DELETE_SUBMISSION)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId was not specified", async () => {
            request(app)
                .delete(DELETE_SUBMISSION)
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            request(app)
                .delete(DELETE_SUBMISSION)
                .set('Cookie', cookie)
                .send({ submissionId: v4() })
                .expect(404);
        });

        it ("returns 401 if the user is not the author of the submission", async () => {
            const newUser = generateValidUserModel();
            await newUser.save();

            const submission = generateValidSubmissionModelWithAuthor(newUser._id);
            await submission.save();

            request(app)
                .delete(DELETE_SUBMISSION)
                .set('Cookie', cookie)
                .send({ submissionId: submission.directory })
                .expect(401);
        });

        it ("returns 200 if we were able to delete the submission", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);

            request(app)
                .delete(DELETE_SUBMISSION)
                .set('Cookie', cookie)
                .send({ submissionId: submission.directory })
                .expect(200);
        });
    });
});