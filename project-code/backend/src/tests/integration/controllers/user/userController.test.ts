import "reflect-metadata";
import Server from "@server/server";
import {Express} from "express";
import request from "supertest";
import {expect} from "chai";
import {describe} from "mocha";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import createTestConfig from "@tests/config/testConfig";
import {createApiLoginUser, createApiRegisterUser} from "@tests/seed/fakeData";
import {generateUserModelWithRole, generateValidUserModel} from "@tests/seed/fakeModels";
import {ApiLoginUser} from "@validation/body/apiUser";
import {
    ADD_ROLE_ENDPOINT,
    CHANGE_FIELDS_ENDPOINT,
    CHANGE_PASSWORD_ENDPOINT, CHANGE_PROFILE_VISIBILITY,
    GET_DETAILS_ENDPOINT,
    GET_PUBLIC_PROFILE_ENDPOINT,
    LOGIN_ENDPOINT,
    LOGOUT_ENDPOINT,
    REGISTER_ENDPOINT
} from "@tests/config/specificationEndpoints";
import getLoginCookie, {encryptData} from "@tests/integration/helper/utilityRequests";
import {UserRole} from "@models/user/userModel";
import {v4} from "uuid";
import {ApiChangePassword} from "@validation/body/apiChangePassword";
import {ApiChangeFields} from "@validation/body/apiChangeFields";
import {ApiChangeFieldVisibility} from "@validation/body/apiChangeFieldVisibility";

describe('User Controller Integration Tests', function () {
    let app : Express;
    let server : Server;

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
    });

    describe (`POST ${REGISTER_ENDPOINT}`, () => {
        it ("returns 400 if the email is not defined", async () => {
            const userRequest = { ...createApiRegisterUser(), email: undefined }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 400 if the firstName is not defined", async () => {
            const userRequest = { ...createApiRegisterUser(), firstName: undefined }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 400 if the password is not defined", async () => {
            const userRequest = { ...createApiRegisterUser(), password: undefined }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 400 if the username is not defined", async () => {
            const userRequest = { ...createApiRegisterUser(), username: undefined }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 400 if the last name is not defined", async () => {
            const userRequest = { ...createApiRegisterUser(), lastName: undefined }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 400 if the password is less than 4 characters", async () => {
            const userRequest = { ...createApiRegisterUser(), password: "abc" }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 400 if the password is greater than 20 characters", async () => {
            const userRequest = { ...createApiRegisterUser(), password: "012345678901234567891" }

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });

        it ("returns 401 if the email is an invalid email", async () => {
            const userModel = generateValidUserModel();
            await userModel.save();

            const userRequest = { ...createApiRegisterUser(), email: "some-random-email" };

            await request(app)
                .post(REGISTER_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });
    });

    describe (`POST ${LOGIN_ENDPOINT}`, () => {
        it ("returns 400 if the password is not defined", async () => {
            const userRequest = { ...createApiLoginUser(), password: undefined };

            const { body } = await request(app)
                .post(LOGIN_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);

            expect (body.status).to.be.eql("failure");
        });

        it ("returns 400 if the email has not been provided", async () => {
            const userRequest = { ...createApiLoginUser(), email: undefined };

            const { body } = await request(app)
                .post(LOGIN_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);

            expect (body.status).to.be.eql("failure");
        });
        
        it ("returns 400 if the user does not exist", async () => {
            const userRequest = createApiLoginUser();

            const { body } = await request(app)
                .post(LOGIN_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);

            expect (body.status).to.be.eql("failure");
        });
        
        it ("returns 400 if the password is not correct", async () => {
            const userModel = generateValidUserModel();
            await userModel.save();

            const userRequest : ApiLoginUser = {
                email: userModel.email,
                password: "some-ivalid-password"
            };

            await request(app)
                .post(LOGIN_ENDPOINT)
                .send(encryptData(userRequest))
                .expect(400);
        });
    });

    describe (`POST ${ADD_ROLE_ENDPOINT}`, () => {
        it ("returns 400 if no body was provided", async () => {
            const user = generateUserModelWithRole(UserRole.ADMIN);
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .put(ADD_ROLE_ENDPOINT)
                .set('Cookie', cookie)
                .send({})
                .expect(400);
        });


        it ("returns 403 if the user is unauthorized", async () => {
            const user = generateValidUserModel();
            await user.save();

            await request(app)
                .put(ADD_ROLE_ENDPOINT)
                .send({ userId: user.id, role: UserRole.ADMIN })
                .expect(403);
        });

        it ("returns 403 if the user is not an admin", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .put(ADD_ROLE_ENDPOINT)
                .set('Cookie', cookie)
                .send({ userId: user.id, role: UserRole.ADMIN })
                .expect(403);
        });

        it ("returns 200 if the role was changed", async () => {
            const user = generateUserModelWithRole(UserRole.ADMIN);
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .put(ADD_ROLE_ENDPOINT)
                .set('Cookie', cookie)
                .send({ userId: user.id, role: UserRole.ADMIN })
                .expect(200);
        });
    });

    describe (`POST ${LOGOUT_ENDPOINT}`, async () => {
        it ("returns 403 if the user is not logged in", async () => {
            await request(app)
                .post(LOGOUT_ENDPOINT)
                .expect(401);
        });

        it ("returns 200 and clears the cookie", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

            const response = await request(app)
                .post(LOGOUT_ENDPOINT)
                .set('Cookie', cookie)
                .send({});

            expect(response.headers['set-cookie'][0]).to.contain('session=;');
        });
    });

    describe (`GET ${GET_DETAILS_ENDPOINT}`, () => {
        it ("returns 403 if the user is not logged in", async () => {
            await request(app)
                .get(GET_DETAILS_ENDPOINT)
                .send()
                .expect(401);
        });

        it ("returns 200 if the user is logged in", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

             await request(app)
                .get(GET_DETAILS_ENDPOINT)
                .set('Cookie', cookie)
                .send()
                .expect(200);
        });
    });

    describe (`GET ${GET_PUBLIC_PROFILE_ENDPOINT}`, async () => {
        it ("returns 404 if the given user does not exist", async () => {
            await request(app)
                .get(GET_PUBLIC_PROFILE_ENDPOINT.replace(':id', v4()))
                .send()
                .expect(404);
        });

        it ("returns 200 and the publicly accessible details from the user", async () => {
            const user = generateValidUserModel();
            user.profile.fieldVisibility.email = false;
            await user.save();

            const response = await request(app)
                .get(GET_PUBLIC_PROFILE_ENDPOINT.replace(':id', user.id))
                .send()
                .expect(200);

            expect(response.body.details).to.be.eql({
                firstName: user.firstName,
                hasVerifiedEmail: user.hasVerifiedEmail,
                id: user.id,
                role: user.role,
                team: user.journalInfo.homeJournal,
                username: user.username,
                lastName: user.lastName
            });
        });
    });

    describe (`POST ${CHANGE_PASSWORD_ENDPOINT}`, () => {
        it ("returns 401 if the user is not authorized", async () => {
            await request(app)
                .post(CHANGE_PASSWORD_ENDPOINT)
                .send({})
                .expect(401);
        });

        it ("returns 400 if the currentPassword is not defined", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

            const newPassword = { newPassword: "some-pass-word-here" } as ApiChangePassword;

            await request(app)
                .post(CHANGE_PASSWORD_ENDPOINT)
                .send(encryptData(newPassword))
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });

        it ("returns 400 if the newPassword is not defined", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });
            const newPassword = { currentPassword: password } as ApiChangePassword;

            await request(app)
                .post(CHANGE_PASSWORD_ENDPOINT)
                .send(encryptData(newPassword))
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });

        it ("returns 400 if the new password is less than four characters", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const newPassword = "123";
            const cookie = await getLoginCookie(app, { email: user.email, password });
            const changePassword = { newPassword, currentPassword: password } as ApiChangePassword;

            await request(app)
                .post(CHANGE_PASSWORD_ENDPOINT)
                .send(encryptData(changePassword))
                .set('Cookie', cookie)
                .send()
                .expect(400);
        });
    });

    describe ("changeProfileField tests", async () => {
        it ("returns 401 if the user is not logged in", async () => {
            const changeFields = { email: "example.com" } as ApiChangeFields;
            
            await request(app)
                .post(CHANGE_FIELDS_ENDPOINT)
                .send(changeFields)
                .send()
                .expect(401);
        });

        it ("returns 400 if the email is not an email", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const changeFields = { email: "example.com" } as ApiChangeFields;
            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .post(CHANGE_FIELDS_ENDPOINT)
                .set('Cookie', cookie)
                .send(changeFields)
                .expect(400);
        });

        it ("returns 400 if the twitter link is not a url", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const changeFields = { twitter: "twitter.com" } as ApiChangeFields;
            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .post(CHANGE_FIELDS_ENDPOINT)
                .set('Cookie', cookie)
                .send(changeFields)
                .expect(400);
        });

        it ("returns 400 if the facebook link is not a url", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const changeFields = { facebook: "facebook.com" } as ApiChangeFields;
            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .post(CHANGE_FIELDS_ENDPOINT)
                .set('Cookie', cookie)
                .send(changeFields)
                .expect(400);
        });

        it ("returns 400 if the linkedIn link is not a url", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const changeFields = { linkedIn: "linkedIn.com" } as ApiChangeFields;
            const cookie = await getLoginCookie(app, { email: user.email, password });

            await request(app)
                .post(CHANGE_FIELDS_ENDPOINT)
                .set('Cookie', cookie)
                .send(changeFields)
                .expect(400);
        });

        it ("returns success if we were able to change the user's details", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const changeFields = { email: "example@example.com"} as ApiChangeFields;
            const cookie = await getLoginCookie(app, { email: user.email, password });
            await request(app)
                .post(CHANGE_FIELDS_ENDPOINT)
                .set('Cookie', cookie)
                .send(changeFields)
                .expect(200);
        });
    });

    describe ("changeProfileFieldVisibility tests", async () => {
        it ("returns 401 if the user is not authorized", async () => {
            const toSend = { field: 'email', visible: true } as ApiChangeFieldVisibility;

            await request(app)
                .post(CHANGE_PROFILE_VISIBILITY)
                .send(toSend)
                .expect(401);
        });

        it ("returns 400 if field is not specified", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });

            const toSend = { visible: false } as ApiChangeFieldVisibility;

            await request(app)
                .post(CHANGE_PROFILE_VISIBILITY)
                .set('Cookie', cookie)
                .send(toSend)
                .expect(400);
        });

        it ("returns 400 if field is not of the specified value", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });
            const toSend = { field: "lol", visible: false };

            await request(app)
                .post(CHANGE_PROFILE_VISIBILITY)
                .set('Cookie', cookie)
                .send(toSend)
                .expect(400);
        });

        it ("returns 400 if visible is not defined", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });
            const toSend = { field: "email" } as ApiChangeFieldVisibility;

            await request(app)
                .post(CHANGE_PROFILE_VISIBILITY)
                .set('Cookie', cookie)
                .send(toSend)
                .expect(400);
        });

        it ("returns 400 if visible is not of the specified value", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });
            const toSend = { field: "email", visible: 122 };

            await request(app)
                .post(CHANGE_PROFILE_VISIBILITY)
                .set('Cookie', cookie)
                .send(toSend)
                .expect(400);
        });

        it ("returns 200 if we could change the visibility of a user's fields", async () => {
            const user = generateValidUserModel();
            const password = user.password;
            await user.save();

            const cookie = await getLoginCookie(app, { email: user.email, password });
            const toSend = { field: "email", visible: false };

            await request(app)
                .post(CHANGE_PROFILE_VISIBILITY)
                .set('Cookie', cookie)
                .send(toSend)
                .expect(200);
        })
    });
});