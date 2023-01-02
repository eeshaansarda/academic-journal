import {SessionUser} from "@validation/session/SessionUser";
import {IUser, UserRole} from "@models/user/userModel";
import UserController from "@controllers/api/user/userController";
import {expect} from "chai";
import {describe} from "mocha";
import {ApiLoginUser, ApiRegisterUser, PublicApiUser} from "@validation/body/apiUser";
import sinon from "sinon";
import {response} from "express";
import {BadRequestError, NotFoundError} from "routing-controllers";
import UserRepositoryMock from "@mocks/repository/user/userRepositoryMock";
import BanRepositoryMock from "@mocks/repository/ban/banRepositoryMock";
import {CookieProviderMock} from "@mocks/auth/cookieProvider";
import {ApiChangePassword} from "@validation/body/apiChangePassword";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {ApiAddRole} from "@validation/body/apiRole";
import { getUserPair } from '@tests/seed/fakeData';
import { GetProfilePictureQuery } from '@validation/query/getProfilePictureQuery';
import { ApiChangeFieldVisibility, ProfileField } from '@server/validation/body/apiChangeFieldVisibility';
import { ApiChangeFields } from "@server/validation/body/apiChangeFields";
import EmailService from "@server/services/emailService";
import DecryptionService from "@server/services/decryptionService";
import Encryptor from "@tests/utilities/encryption";
import fs from 'fs';
import NotificationService from "@server/services/notificationService";
import SocketService from "@server/services/socketService";

const RSA_PUBLIC_KEY = fs.readFileSync('public.key').toString();

describe('User Controller Tests', () => {
    const encryptor = new Encryptor(RSA_PUBLIC_KEY);
    let userController: UserController;
    let userRepositoryMock: UserRepositoryMock;
    let cookieProviderMock: CookieProviderMock;
    let banRepositoryMock: BanRepositoryMock;
    let sessionUser: SessionUser;
    let userDocument: Partial<IUser>;

    beforeEach(() => {
        userController = new UserController(new EmailService(), new DecryptionService(), new NotificationService(new SocketService()), new SocketService());
        userController.userModel = userRepositoryMock = new UserRepositoryMock();
        userController.cookieProvider = cookieProviderMock = new CookieProviderMock();
        userController.banModel = banRepositoryMock = new BanRepositoryMock();

        [sessionUser, userDocument] = getUserPair();
    });

    describe("Get Details Tests", () => {
        it('Throws an error if the user is not signed in', async () => {
            sessionUser.id = 'fakeId';

            await expectThrowsAsync(
                NotFoundError,
                async () => await userController.getDetails(sessionUser)
            );
        });

        it("Returns the details of the current session user", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const returned = await userController.getDetails(sessionUser);
            expect(returned.status).to.be.equal('success');
            expect(returned.details).to.be.eql({
                ...sessionUser,
                profile: userDocument.profile,
                homeJournal: userDocument.journalInfo?.homeJournal
            });
        });
    });
    
    describe('View Profile Details Tests', () => {
        it('Throws an error if the user is not signed in', async () => {
            await expectThrowsAsync(
                NotFoundError,
                async () => await userController.viewProfile('fakeId')
            );
        });

        it("Returns the user's profile details", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const result = await userController.viewProfile(sessionUser.id);
            expect(result.status).to.be.equal('success');
            expect(result.details).to.be.eql(PublicApiUser.createPublicApiUserFromDocument(userDocument as IUser));
        });
    })

    describe("View Profile Picture Tests", () => {
        it("Throws an error if the user does not exist", async () => {
            const query: GetProfilePictureQuery = {
                userId: 'test'
            };

            const mockResponse = sinon.stub(response);
            await expectThrowsAsync(
                BadRequestError, 
                async () => await userController.getProfilePicture(sessionUser, query, mockResponse)
            );
        });

        it("Throws an error if the user does not have a profile picture", async () => {
            userDocument.profile!.profilePicture.url = '';
            userRepositoryMock.getUserFromId.returns(userDocument);

            const query: GetProfilePictureQuery = {
                userId: sessionUser.id
            };
            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(
                NotFoundError, 
                async () => await userController.getProfilePicture(sessionUser, query, mockResponse)
            );
        });

        it("Returns the user's profile picture", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const query: GetProfilePictureQuery = {
                userId: sessionUser.id
            };
            const mockResponse = sinon.stub(response);

            await userController.getProfilePicture(sessionUser, query, mockResponse);
            sinon.assert.calledWith(mockResponse.redirect, userDocument.profile!.profilePicture.url);
        });
    });

    describe("Login Tests", () => {
        it("Throws an error if the user is not a home user", async () => {
            userDocument.isHomeUser = () => false;
            userRepositoryMock.getHomeUserFromEmail.returns(userDocument);

            const loginDetails : ApiLoginUser = {
                email: userDocument.email!,
                password: userDocument.password!
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(loginDetails))
            };
            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(BadRequestError,
                async () => await userController.login(body, mockResponse));
        });

        it("Throws an error if the user could not be found", async () => {
            userRepositoryMock.getHomeUserFromEmail.returns(null);

            const mockResponse = sinon.stub(response);
            const loginDetails : ApiLoginUser = {
                email: "qwerty@qwerty.com",
                password: "1234"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(loginDetails))
            };

            await expectThrowsAsync(BadRequestError,
                async () => await userController.login(body, mockResponse));
        });

        it("Throws an unauthorized error if the password the user provided is incorrect", async () => {
            userDocument.checkPassword = async () => false;
            userRepositoryMock.getHomeUserFromEmail.returns(userDocument);

            const loginDetails = {
                email: "wrong_email@email.com",
                password: "wrong-password"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(loginDetails))
            };

            const mockResponse = sinon.stub(response);
            await expectThrowsAsync(BadRequestError,
                async () => await userController.login(body, mockResponse));
        });
    });

    describe("Register Tests", () => {
        it("Throws a BadRequestError if the user already exists", async () => {
            const user : ApiRegisterUser = {
                email: "some-email@example.com",
                password: "123456",
                username: "a-username-sort-of",
                firstName: "Jeff",
                lastName: "Alice"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(user))
            };

            const newUser = {
                id: "some-user-id",
                username: "some-user-name",
                email: "email@email.com",
                password: "Eek123",
                role: UserRole.USER,
                isBanned: true,
                isHomeUser: () => true,
                createdAt: new Date(2020, 1, 1)
            };

            userRepositoryMock.doesHomeUserExist.returns(true);
            userRepositoryMock.createHomeUser.returns(newUser);

            const mockResponse = sinon.stub(response);
            await expectThrowsAsync(BadRequestError,
                async () => await userController.register(body, mockResponse));
        });

        it("Creates a user if the credentials are correct", async () => {
            const user : ApiRegisterUser = {
                email: "some-email@example.com",
                password: "123456",
                username: "a-username-sort-of",
                firstName: "Jeff",
                lastName: "Alice"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(user))
            };

            userRepositoryMock.doesHomeUserExist.returns(false);
            userRepositoryMock.createHomeUser.returns(userDocument);

            const mockResponse = sinon.stub(response);
            cookieProviderMock.createSessionCookie.returns(mockResponse);

            await userController.register(body, mockResponse);

            expect(cookieProviderMock.createSessionCookie.called).to.be.true;
            expect(mockResponse.send.getCall(0).firstArg).to.eql({ status: 'success' });
        });
    });

    describe("Change Password Tests", () => {
        it("Throws an error if the session user does not exist as a home user", async () => {
            userDocument.isHomeUser = () => false;
            userRepositoryMock.getHomeUserFromEmail.returns(userDocument);

            const newPassword: ApiChangePassword = {
                newPassword: "$1234",
                currentPassword: "$123456"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(newPassword))
            };
            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(
                BadRequestError,
                async () => await userController.changePassword(body, sessionUser, mockResponse)
            );
        });

        it("Throws an error if the old password does not matched the stored password", async () => {
            userDocument.checkPassword = async () => false;
            userRepositoryMock.getHomeUserFromEmail.returns(userDocument);

            const newPassword: ApiChangePassword = {
                newPassword: "$1234",
                currentPassword: "$123456"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(newPassword))
            };
            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(BadRequestError,
                async () => await userController.changePassword(body, sessionUser, mockResponse)
            );
        });

        it("Throws an error if the given user does not exist", async () => {
            userRepositoryMock.getHomeUserFromEmail.returns(null);
            
            const newPassword: ApiChangePassword = {
                newPassword: "$1234",
                currentPassword: "$123456"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(newPassword))
            };
            const mockResponse = sinon.stub(response);

            await expectThrowsAsync(BadRequestError,
                async () => await userController.changePassword(body, sessionUser, mockResponse)
            );
        });

        it("Changes the user's password and clears the cookie when the password matches the one provided", async () => {
            userDocument.isHomeUser = () => true;
            userDocument.checkPassword = async () => true;
            userRepositoryMock.getUserFromId.returns(userDocument);

            const apiNewPassword: ApiChangePassword = {
                newPassword: "$1234",
                currentPassword: "$123456"
            };
            const body = {
                data: encryptor.encrypt(JSON.stringify(apiNewPassword))
            };

            const mockResponse = sinon.stub(response);
            cookieProviderMock.clearCookie.returns(mockResponse);

            await userController.changePassword(body, sessionUser, mockResponse);

            expect(userDocument.password).to.eql(apiNewPassword.newPassword);
            expect(mockResponse.send.getCall(0).firstArg).to.eql({ status: 'success' });
        });
    });

    describe('Change Profile Picture Tests', () => {
        it("Throws an error if the user is not signed in", async () => {
            const file = {};

            userRepositoryMock.getHomeUserFromEmail.returns(null);
            await expectThrowsAsync(
                BadRequestError,
                async () => await userController.changeProfilePicture(sessionUser, file)
            );
        });
    });

    describe('Change Profile Fields Tests', () => {
        it("Throws an error if the user is not signed in", async () => {
            userRepositoryMock.getHomeUserFromEmail.returns(null);
            const body = {};

            await expectThrowsAsync(
                BadRequestError,
                async () => await userController.changeProfileFields(sessionUser, body)
            );
        });

        it("Successfully changes the user's email", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                email: 'newemail@domain.com'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.email).to.eql(body.email);
        });

        it("Successfully changes the user's first name", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                firstName: 'Scott'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.firstName).to.eql(body.firstName);
        });

        it("Successfully changes the user's last name", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                lastName: 'Davidson'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.lastName).to.eql(body.lastName);
        });

        it("Successfully changes the user's institution", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                institution: 'University of California'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.profile!.institution).to.eql(body.institution);
        });

        it("Successfully changes the user's biography", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                biography: 'I like programming!'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.profile!.biography).to.eql(body.biography);
        });

        it("Successfully changes the user's Twitter link", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                twitter: 'https://twitter.com/scott'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.profile!.socialMedia.twitter).to.eql(body.twitter);
        });

        it("Successfully changes the user's Facebook link", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                facebook: 'https://facebook.com/scott'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.profile!.socialMedia.facebook).to.eql(body.facebook);
        });

        it("Successfully changes the user's LinkedIn link", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                linkedIn: 'https://linkedin.com/scott'
            };
            await userController.changeProfileFields(sessionUser, body);

            expect(userDocument.profile!.socialMedia.linkedIn).to.eql(body.linkedIn);
        });

        it("Throws a BadRequestError when the social media link provided is not a valid URL", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                linkedIn: 'abc'
            };

            await expectThrowsAsync(
                BadRequestError,
                async () => await userController.changeProfileFields(sessionUser, body)
            );
        });

        it("Throws a BadRequestError when the social media link provided is not for that social media", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFields = {
                twitter: 'https://facebook.com/scott'
            };

            await expectThrowsAsync(
                BadRequestError,
                async () => await userController.changeProfileFields(sessionUser, body)
            );
        });
    });

    describe('Change Profile Field Visibility Tests', () => {
        it("Throws an error if the user is not signed in", async () => {
            userRepositoryMock.getHomeUserFromEmail.returns(null);

            const body: ApiChangeFieldVisibility = {
                field: ProfileField.FirstName,
                visible: false
            };

            await expectThrowsAsync(
                BadRequestError,
                async () => await userController.changeProfileFieldVisibility(sessionUser, body)
            );
        });

        it("Successfully changes the user's profile field visiblity", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiChangeFieldVisibility = {
                field: ProfileField.FirstName,
                visible: false
            };
            await userController.changeProfileFieldVisibility(sessionUser, body);

            expect(userDocument.profile!.fieldVisibility.firstName).to.eql(false);
        });
    });

    describe("Change Role Tests", () => {
        it("Throws a NotFoundError if the session user could not be found", async () => {
            userRepositoryMock.getHomeUserFromEmail.returns(null);

            const apiChangeRole : ApiAddRole = {
                role: UserRole.ADMIN,
                userId: 'fakeId'
            };

            await expectThrowsAsync(NotFoundError,
                async () => await userController.setRole(apiChangeRole));
        });

        it("Changes the user role upon success", async () => {
            userRepositoryMock.getUserFromId.returns(userDocument);

            const body: ApiAddRole = {
                role: UserRole.ADMIN,
                userId: sessionUser.id
            };;

            const result = await userController.setRole(body);

            expect(result).to.be.eql({ status: "success" });
            expect((userDocument.save as sinon.SinonStub).called).to.be.true;
        });
    });

    describe("Logout Tests", () => {
        it("Clears the user's cookie upon logout", () => {
            const mockResponse = sinon.stub(response);
            cookieProviderMock.clearCookie.returns(mockResponse);

            userController.logout(mockResponse);
            expect(cookieProviderMock.clearCookie.called).to.be.true;
            expect(mockResponse.send.firstCall.firstArg).to.be.eql({ status: "success" });
        });
    });

    afterEach(() => {
       sinon.restore();
    });
});