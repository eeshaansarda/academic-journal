import {Express} from "express";
import Server from "@server/server";
import {IUser} from "@models/user/userModel";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import createTestConfig from "@tests/config/testConfig";
import {
    generateValidSubmissionModelWithAuthor, generateValidSupportingDocumentModel,
    generateValidUserModel
} from "@tests/seed/fakeModels";
import getLoginCookie from "@tests/integration/helper/utilityRequests";
import request from "supertest";
import {SUPPORTING_DOCUMENT, SUPPORTING_DOCUMENT_METADATA} from "@tests/config/specificationEndpoints";
import {v4} from "uuid";
import {expect} from "chai";
import {ISupportingDocument} from "@models/submission/supportingDocument/supportingDocumentModel";
import {describe} from "mocha";

describe ("supportingDocumentController integration tests", () => {
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

    describe ("addSupporting documents tests", () => {
        it ("returns 401 if the user is not authorized", async () => {
            request(app)
                .put(SUPPORTING_DOCUMENT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the document is not provided", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .send({ submissionId: v4() })
                .expect(400);
        });
    });

    describe ("getMetadata tests", () => {
        it ("returns 401 if the user is not authorized", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT_METADATA)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submission is not defined", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT_METADATA)
                .set('Cookie', cookie)
                .query({})
                .send()
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT_METADATA)
                .set('Cookie', cookie)
                .query({ submissionId: v4() })
                .send()
                .expect(404)
        });

        it ("returns 200 and the corresponding supporting documents on success", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            const document = generateValidSupportingDocumentModel();

            submission.supportingDocuments.push(document as ISupportingDocument);
            await submission.save();

            const { body } = await request(app)
                .get(SUPPORTING_DOCUMENT_METADATA)
                .set('Cookie', cookie)
                .query({ submissionId: submission.directory })
                .send()
                .expect(200);

            expect(body.documents[0].id).to.be.eql(document.id);
        });
    });

    describe ("getSupportingDocument tests", () => {
        it ("returns 401 if the user is not authorized", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId is not defined", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ supportingDocumentId: v4() })
                .send()
                .expect(400);
        });

        it ("returns 400 if the supportingDocumentId is not defined", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ submissionId: v4() })
                .send()
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            request(app)
                .get(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ submissionId: v4(), supportingDocumentId: v4() })
                .send()
                .expect(404);
        });

        it ("returns 404 if the supporting document does not exist", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            request(app)
                .get(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ submissionId: submission.directory, supportingDocumentId: v4() })
                .send()
                .expect(404);
        });
    });

    describe ("deleteSupportingDocument tests", () => {
        it ("returns 401 if the user is not authorized", async () => {
            request(app)
                .delete(SUPPORTING_DOCUMENT)
                .send()
                .expect(401);
        });

        it ("returns 400 if the submissionId is not defined", async () => {
            request(app)
                .delete(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ supportingDocumentId: v4() })
                .expect(400)
        });

        it ("returns 400 if the supportingDocumentId is not defined", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            request(app)
                .delete(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query( { submissionId: submission.directory })
                .expect(400);
        });

        it ("returns 404 if the submission does not exist", async () => {
            request(app)
                .delete(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ submissionId: v4(), supportingDocument: v4() })
                .expect(404);
        });

        it ("returns 404 if the supporting document does not exist", async () => {
            const submission = generateValidSubmissionModelWithAuthor(user._id);
            await submission.save();

            request(app)
                .delete(SUPPORTING_DOCUMENT)
                .set('Cookie', cookie)
                .query({ submissionId: submission.directory, supportingDocumentId: v4() })
                .expect(404);
        });
    });
});