import UserRepositoryMock from "@mocks/repository/user/userRepositoryMock";
import {IUser} from "@models/user/userModel";
import UsersController from "@controllers/api/user/usersController";
import {expect} from "chai";
import {describe} from "mocha";
import sinon from "sinon";
import {generateFakeUser, getUserPair} from "@tests/seed/fakeData";
import {ApiUser, PublicApiUser} from "@validation/body/apiUser";

describe("Users Controller Tests", () => {
    let usersController: UsersController;
    let mockUserRepository: UserRepositoryMock;

    beforeEach(() => {
        usersController = new UsersController();
        usersController.userModel = mockUserRepository = new UserRepositoryMock();
    });

    describe("Get Users Tests", () => {
        it("Getting a list of users when the search returns no users", async () => {
            const users: IUser[] = [];
            mockUserRepository.getUsers.returns([0, users]);

            const result = await usersController.getUsers({ sort: 1, pageNumber: 0 });

            expect(result).to.be.eql({
                status: "success",
                users: [],
                numUsers: 0
            });
        });

        it("Getting a list of users returns documents equal to the page size", async () => {
            const users = [getUserPair()[1], getUserPair()[1], getUserPair()[1], getUserPair()[1]];

            mockUserRepository.getUsers.returns([4, users]);

            const result = await usersController.getUsers({ sort: 1, pageNumber: 0 });

            const expectedUsers = users.map(user => PublicApiUser.createPublicApiUserFromDocument(user as IUser));
            expect(result).to.be.eql({
                status: "success",
                users: expectedUsers,
                numUsers: users.length
            });
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});

