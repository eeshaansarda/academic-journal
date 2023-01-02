import {
    hashUserPassword,
    InvalidPasswordError,
    IUser, IUserModel, UserDoesNotExistError,
    UserModel,
    UsernameError, UserRole
} from "@models/user/userModel";
import sinon from "sinon";
import {expect} from "chai";
import {Document} from "mongoose";
import {describe} from "mocha";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {generateValidApiUser} from "@tests/seed/fakeData";
import {ApiRegisterUser} from "@validation/body/apiUser";
import {createBanModel, generateValidUserModel} from "@tests/seed/fakeModels";
import {BanModel} from "@models/ban/banModel";
import * as faker from "faker";
import {v4, v4 as uuidv4} from "uuid";
import { config } from "@config/config";
import {UsersQuery} from "@validation/query/usersQuery";
import {expectThrowsAsync} from "@tests/utilities/assertions";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});

describe('User Model Tests', () => {
    let userModel: IUserModel = UserModel;

    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    describe('Validation tests', () => {
        it('throws an error if the username is less than four characters', (done) => {
            const user: IUser = new userModel({
                username: "abc",
                email: "example@example.com",
                password: "$SomeValidPassword123",
                firstName: "John",
                lastName: "Smith",
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });

            user.validate(err => {
                expect(err).to.be.instanceof(UsernameError);
                done();
            });
        });

        it('throws an error if the password if no password defined and a home journal user', (done) => {
            const user: IUser = new userModel({
                id: "some id here",
                username: "abc123",
                email: "example@example.com",
                firstName: "John",
                lastname: "Smith",
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });

            user.validate(err => {
                expect(err).to.be.instanceof(InvalidPasswordError);
                done();
            });
        });

        it('throws an error if the password is not a valid password', (done) => {
            const user: IUser = new UserModel({
                id: "some id here",
                username: "abc123",
                email: "example@example.com",
                firstName: "John",
                lastName: "Smith",
                password: "invalid_pass",
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });

            user.validate(err => {
                expect(err).to.be.instanceof(InvalidPasswordError);
                done();
            });
        });
    });

    describe('Hash User Password Tests', () => {
        it('converts the password to a hash on save', async () => {
            let previousPassword = "$SomeValidPassword123";

            const user: IUser = new UserModel({
                id: "some id here",
                username: "abc123",
                email: "example@example.com",
                firstName: "John",
                lastName: "Smith",
                password: previousPassword,
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });

            const next = sinon.stub();
            await hashUserPassword(user, next);
            expect(user.password).to.not.equal(previousPassword);
        });

        it('does not hash the password if the password has not changed', async () => {
            let previousPassword = "fjfjsfjkfjkfdjkfdlkjfsljfkdfjl";

            const user: IUser = new UserModel({
                id: "some id here",
                username: "abc123",
                email: "example@example.com",
                firstName: "John",
                lastName: "Smith",
                password: previousPassword,
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });
            user.isModified = sinon.fake((property: string) => property !== "password");
            await hashUserPassword(user, sinon.stub())
            expect(user.password).to.equal(previousPassword);
        });
    });

    describe('Check user password', () => {
        it('returns true when a password hashes to the same value', async () => {
            const password = "$SomeValidPasswordHere123";

            const user: IUser = new UserModel({
                id: "some id here",
                username: "abc123",
                email: "example@example.com",
                firstName: "John",
                lastName: "Smith",
                password,
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });

            await hashUserPassword(user, sinon.stub());
            expect(await user.checkPassword(password)).to.be.true;
        });

        it('returns false when a password hashes to a different value', async () => {
            const password = "$SomeValidPasswordHere123";

            const user: IUser = new UserModel({
                id: "some id here",
                username: "abc123",
                email: "example@example.com",
                firstName: "John",
                lastName: "Smith",
                password,
                role: UserRole.USER,
                isBanned: false,
                profile: {
                    profilePictureFileName: '',
                    fieldVisibility: {
                        firstName: true,
                        lastName: true,
                        email: false,
                        profilePicture: true,
                        institution: true,
                        biography: true
                    }
                },
                journalInfo: {
                    homeJournal: config.journalId
                }
            });

            await hashUserPassword(user, sinon.stub());
            expect(await user.checkPassword(password.substring(0, -2))).to.be.false;
        });
    });

    describe('Create Home User Tests', () => {
        it('given a valid api user the method creates a new user model and the password is valid', async () => {
            const user = generateValidApiUser();
            const userDoc = await UserModel.createHomeUser(user as ApiRegisterUser, '$Paz@@!#$%djfdkf1222');
            expect(userDoc).to.be.instanceOf(Document);

            expect(userDoc.username).to.be.equal(user.username);
            expect(userDoc.email).to.be.equal(user.email);
            expect(userDoc.firstName).to.be.equal(user.firstName);
            expect(userDoc.lastName).to.be.equal(user.lastName);
            expect(userDoc.role).to.be.equal(userDoc.role);
            expect(userDoc.journalInfo.homeJournal).to.be.eql(config.journalId);
        });

        it('given an invalid api user the method throws an error', (done) => {
            const user = generateValidApiUser();
            user.username = "dom";

            UserModel.createHomeUser(user as ApiRegisterUser, '$Paz@@!#$%djfdkf1222').catch(err => {
                expect(err).to.be.instanceof(UsernameError);
                done();
            });
        });
    });

    describe('Get Users Tests', () => {
        const generateUsers = async (num: number) => {
            const users: IUser[] = [];

            for (let i = 0; i < num; i++) {
                const user = generateValidUserModel();
                await user.save();
            }

            return users;
        };

        it('returns an empty list if there are no users', async () => {
            const usersQuery : UsersQuery = { pageNumber: 1, sort: 1 };

            const [numUsers, users] = await UserModel.getUsers(usersQuery, 10);

            expect(numUsers).to.be.eql(0);
            expect(users).to.be.empty;
        });

        it('returns all the users sorted by date if there are less users than the page size', async () => {
            const pageSize = 10;
            await generateUsers(pageSize - 1);
            const usersQuery : UsersQuery = { pageNumber: 1, sort: 1 };


            const [numUsers, usersRetrieved] = await UserModel.getUsers(usersQuery, pageSize);

            expect(numUsers).to.be.eql(pageSize - 1);
            expect(usersRetrieved.length).to.be.equal(pageSize - 1);
        });

        it('returns a page if the number of users is greater than the page size', async () => {
            const pageSize = 10;
            const size = 19;
            await generateUsers(size);
            const usersQuery : UsersQuery = { pageNumber: 2, sort: 1 };


            const users = await UserModel.find({}).sort({ username: 1 }).exec();
            const [numUsers ,usersRetrieved] = await UserModel.getUsers(usersQuery, pageSize);

            expect(numUsers).to.be.eql(size);
            expect(usersRetrieved.map(user => user.id)).to.have.ordered.members(users.slice(10).map(user => user.id));
        });

        it('returns the first page if the page number is less than one', async () => {
            const pageSize = 10;
            const size = 15;
            await generateUsers(size);
            const usersQuery : UsersQuery = { pageNumber: 0, sort: 1 };


            const users = await UserModel.find({}).sort({ username: 1 }).exec();
            const [numUsers, usersRetrieved] = await UserModel.getUsers(usersQuery, pageSize);

            expect(numUsers).to.be.eql(size);
            expect(usersRetrieved.map(user => user.id)).to.have.ordered.members(users.slice(0, 10).map(user => user.id));
        });

        it ("sorts the list by username", async () => {
            const pageSize = 10;
            const size = 15;
            await generateUsers(size);
            const usersQuery: UsersQuery = { pageNumber: 0, sort: 1 };

            const users = await UserModel.find({}).sort({ username: 1 }).exec();
            const [numUsers, usersRetrieved] = await UserModel.getUsers(usersQuery, pageSize);

            expect(numUsers).to.be.eql(size);
            expect(usersRetrieved.map(user => user.username)).to.have.ordered.members(users.slice(0, 10).map(user => user.username));
        });

        it ("sorts the list in reverse alphabetical order if sort is -1", async () => {
            const pageSize = 10;
            const size = 15;
            await generateUsers(size);

            const usersQuery : UsersQuery = { pageNumber: 0, sort: -1 };

            const users = await UserModel.find({}).sort({ username: -1 }).exec();
            const [_, usersRetrieved] = await UserModel.getUsers(usersQuery, pageSize);
            expect(usersRetrieved.map(user => user.username)).to.have.ordered.members(users.slice(0, 10).map(user => user.username));
        });

        it ("if the username is provided filters the list by username", async () => {
            const pageSize = 10;
            const size = 15;
            await generateUsers(size);
            const userModel = generateValidUserModel();
            userModel.username = "patrickbamford1234";
            await userModel.save();

            const usersQuery : UsersQuery = { pageNumber: 0, sort: -1, username: "patrickbamford" };

            const [numUsers, usersRetrieved] = await UserModel.getUsers(usersQuery, pageSize);

            expect(numUsers).to.be.eql(1);
            expect(usersRetrieved).to.have.length(1);
            expect(usersRetrieved.map(user => user.username)).to.be.eql(["patrickbamford1234"]);
        });
    });

    describe("Remove Ban Tests", () => {
        it("sets the user's banned attribute to false if the user exists", async () => {
            const issuer = generateValidUserModel();
            await issuer.save();

            const bannedUser = generateValidUserModel();
            await bannedUser.save();

            const ban = createBanModel(issuer, bannedUser);
            await ban.save();

            expect(await bannedUser.isBanned()).to.be.false;
        });

        it("removes the ban document from the database", async () => {
            const issuer = generateValidUserModel();
            await issuer.save();

            const bannedUser = generateValidUserModel();
            await bannedUser.save();

            const ban = createBanModel(issuer, bannedUser);
            await ban.save();

            await UserModel.removeBan(ban);

            expect(await BanModel.docExists({ id: ban.id })).to.be.false;
        });
    });

    describe("Get User From Email Tests", async () => {
        it("returns null if a user with the given email does not exist", async () => {
            expect(await UserModel.getHomeUserFromEmail(faker.internet.email())).to.be.null;
        });

        it("returns the user with the given email if it exists", async () => {
            const user = generateValidUserModel();
            await user.save();

            expect((await UserModel.getHomeUserFromEmail(user.email)).email).to.be.eql(user.email);
        });
    });

    describe("Get User From Id Tests", () => {
        it("returns null if a user with the given id does not exist", async () => {
            expect(await UserModel.getUserFromId(uuidv4())).to.be.null;
        });

        it("returns the user with the given id exists", async () => {
            const user = generateValidUserModel();
            await user.save();

            expect((await UserModel.getUserFromId(user.id)).email).to.be.eql(user.email);
        });
    });

    describe ("Get Dashboard Tests", () => {
        it ("throws an error if the user doesnt exist", async () => {
            await expectThrowsAsync(UserDoesNotExistError,
                async () => UserModel.setDashboard(v4(), "sasdasdd"));
        });
        
        it ("saves the dashboard string if the user exists", async () => {
            let user = generateValidUserModel();
            await user.save();
            
            const dashboard = faker.random.words();
            await UserModel.setDashboard(user.id, dashboard);

            user = await UserModel.findOne({ id: user.id }) as IUser & { _id: any };
            expect(user.dashboard).to.be.eql(dashboard);
        });
    });

    describe('isBanned tests', () => {
        it ("returns true if the user has outstanding bans", async () => {
            const subject = generateValidUserModel();
            await subject.save();

            const issuer = generateValidUserModel();
            await issuer.save();

            const bans = [createBanModel(subject, issuer), createBanModel(subject, issuer)];
            for (const ban of bans) {
                await ban.save();
            }

            expect(await subject.isBanned()).to.be.true;
        });

        it ("returns false if the user has no outstanding bans", async () => {
            const subject = generateValidUserModel();
            await subject.save();
            expect(await subject.isBanned()).to.be.false;
        });
    });

    describe ('getBans tests', () => {
        it ("returns an empty list if there are no outstanding bans for the user", async () => {
            const subject = generateValidUserModel();
            await subject.save();

            expect(await subject.getBans()).to.be.empty;
        });

        it ("returns all bans for the user in descending order", async () => {
            const subject = generateValidUserModel();
            await subject.save();

            const issuer = generateValidUserModel();
            await issuer.save();

            const bans = [createBanModel(subject, issuer), createBanModel(subject, issuer)];
            for (const ban of bans) {
                await ban.save();
            }

            const returnedBans = await subject.getBans();

            expect(returnedBans.map(ban => ban.id))
                .to.be.eql(bans.sort((b1, b2) => b2.expiry.valueOf() - b1.expiry.valueOf())
                .map(ban => ban.id));
        });

    });
});

