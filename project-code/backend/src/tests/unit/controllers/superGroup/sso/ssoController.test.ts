import {describe} from "mocha";
import {
    createSessionUser,
    generateCallBackQuery,
    generateConfirmSsoQuery, generateFakeUser,
    generateSsoLoginQuery, generateValidApiUser
} from "@tests/seed/fakeData";
import {response, request} from "express";
import sinon from "sinon";
import SsoController from "@controllers/api/superGroup/sso/ssoController";
import UserRepositoryMock from "@mocks/repository/user/userRepositoryMock";
import {SsoTokenMock} from "@mocks/helper/ssoMock";
import {expect} from "chai";
import * as faker from "faker";
import { config } from "@config/config";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, ForbiddenError} from "routing-controllers";
import {ApiUser} from "@validation/body/apiUser";

describe("SSO Controller Tests", () => {
    let ssoController: SsoController;
    let userRepositoryMock: UserRepositoryMock;
    let ssoTokenMock: SsoTokenMock;

    beforeEach(() => {
        ssoController = new SsoController();
        ssoController.userModel = userRepositoryMock = new UserRepositoryMock();
        ssoController.ssoToken = ssoTokenMock = new SsoTokenMock();
    });

    describe("Login Tests", () => {
        it("redirects the user to confirm_sso if the user is logged in", async () => {
            const ssoLogin = generateSsoLoginQuery();
            const currentUser = createSessionUser();
            const mockResponse = sinon.stub(response);

            const expectedRedirect = `confirm_sso?redirectUrl=${encodeURIComponent(ssoLogin.from)}&state=${encodeURIComponent(ssoLogin.state)}`;

            await ssoController.login(ssoLogin, currentUser, mockResponse);
            sinon.assert.calledWith(mockResponse.redirect, sinon.match(/\/confirm_sso/));
            expect(mockResponse.redirect.firstCall.firstArg.includes(expectedRedirect)).to.be.true;

        });

        it("redirects the user to login if the user is not logged in", async () => {
            const ssoLogin = generateSsoLoginQuery();
            const currentUser = null;
            const mockResponse = sinon.stub(response);

            const expectedRedirect = `login?sso=true&redirectUrl=${encodeURIComponent(ssoLogin.from)}&state=${encodeURIComponent(ssoLogin.state)}`;

            await ssoController.login(ssoLogin, currentUser, mockResponse);
            sinon.assert.calledWith(mockResponse.redirect, sinon.match(/\/login/));
            expect(mockResponse.redirect.firstCall.firstArg.includes(expectedRedirect)).to.be.true;
        });
    });

    describe("Confirm Tests", () => {
        it("redirects the user to the primary journal url", async () => {
            const ssoConfirm = generateConfirmSsoQuery();
            const currentUser = createSessionUser();
            const mockResponse = sinon.stub(response);

            const jwtToken = 'JWT_TOKEN';
            const expectedRedirect = `api/sg/sso/callback?token=${encodeURIComponent(jwtToken)}&state=${encodeURIComponent(ssoConfirm.state)}&from=${encodeURIComponent(config.backendUrl)}`;

            ssoTokenMock.generateSsoToken.returns(jwtToken);

            const res = await ssoController.confirm(ssoConfirm, currentUser, mockResponse);

            expect(mockResponse.redirect.firstCall.firstArg.includes(expectedRedirect)).to.be.true;
        });
    });

    describe("Callback Tests", () => {
        it("Throws a ForbiddenError if the ssoCookie does not exist", async () => {
            const mockRequest = sinon.stub(request);
            const mockResponse = sinon.stub(response);
            const callbackQuery = generateCallBackQuery();

            mockResponse.cookie.returns(mockResponse);

            await expectThrowsAsync(ForbiddenError, async () => {
                await ssoController.callback(callbackQuery, mockRequest, mockResponse, "");
            });
        });

        it("Throws a ForbiddenError if the expectedState doesn't equal the actual state", async () => {
            const mockRequest = sinon.stub(request);
            const mockResponse = sinon.stub(response);
            const callbackQuery = generateCallBackQuery();
            const ssoCookie = JSON.stringify({ state: "some-random-state", url: faker.internet.url() });

            mockResponse.cookie.returns(mockResponse);
            await expectThrowsAsync(ForbiddenError, async () => {
                await ssoController.callback(callbackQuery, mockRequest, mockResponse, ssoCookie);
            });
        });

        it("Throws a ForbiddenError if the ssoToken is invalid", async () => {
            const mockRequest = sinon.stub(request);
            const mockResponse = sinon.stub(response);
            const callbackQuery = generateCallBackQuery();
            const ssoCookie = JSON.stringify({ state: callbackQuery.state, url: faker.internet.url() });


            mockResponse.cookie.returns(mockResponse);
            ssoTokenMock.checkSsoToken.returns(null);

            await expectThrowsAsync(ForbiddenError, async () => {
                await ssoController.callback(callbackQuery, mockRequest, mockResponse, ssoCookie);
            });
        });

        it("throws a BadRequestError if we were unable to save the user details", async () => {
            const mockRequest = sinon.stub(request);
            const mockResponse = sinon.stub(response);
            const callbackQuery = generateCallBackQuery();
            const ssoCookie = JSON.stringify({ state: callbackQuery.state, url: faker.internet.url()});
            const user = generateValidApiUser();

            mockResponse.cookie.returns(mockResponse);
            ssoTokenMock.checkSsoToken.returns(user);

            userRepositoryMock.createFromApiUser.throws(Error);

            await expectThrowsAsync(BadRequestError, async () => {
                await ssoController.callback(callbackQuery, mockRequest, mockResponse, ssoCookie);
            });
        });

        it("redirects the user to the dashboard page on success", async () => {
            const mockRequest = sinon.stub(request);
            const mockResponse = sinon.stub(response);
            const callbackQuery = generateCallBackQuery();
            const ssoCookie = JSON.stringify({ state: callbackQuery.state, url: faker.internet.url()});
            const user = generateFakeUser();

            mockResponse.cookie.returns(mockResponse);

            mockResponse.cookie.returns(mockResponse);
            userRepositoryMock.createFromApiUser.returns(user);
            ssoTokenMock.checkSsoToken.returns(ApiUser.createApiUserFromDocument(user as any));

            await ssoController.callback(callbackQuery, mockRequest, mockResponse, ssoCookie);

            expect(mockResponse.redirect.firstCall.firstArg.endsWith('/dashboard')).to.be.true;
        });
    });


    describe("Verify Endpoint Tests", () => {
        it("Throws a forbidden error if the sso token is invalid", async () => {
            const token = faker.datatype.string();

            ssoTokenMock.decodeSsoToken.throws(Error);

            await expectThrowsAsync(ForbiddenError,
                async () => ssoController.verify(token));
        });

        it("Throws a forbidden error if the JwtPayload is null", async () => {
            const token = faker.datatype.string();

            ssoTokenMock.decodeSsoToken.returns(null);

            await expectThrowsAsync(ForbiddenError,
                async () => ssoController.verify(token));

        });

        it("Returns success if we were able to verify the ssoToken", async () => {
            const token = faker.datatype.string();
            const user = generateFakeUser();

            userRepositoryMock.getOne.returns(user);
            ssoTokenMock.decodeSsoToken.returns(user);

            const result = await ssoController.verify(token);

            expect(result).to.be.eql({
                status: 'ok',
                name: `${user.firstName} ${user.lastName}`,
                profilePictureUrl: user.profile.profilePicture.url,
                email: user.email,
                id: user.id
            });
        });
    });

    afterEach(() => {
        sinon.restore();
        request.cookies = {};
    });
});