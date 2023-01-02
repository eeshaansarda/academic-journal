import SGUsersController from "@controllers/api/superGroup/users/sgUsersController";
import UserRepositoryMock from "@mocks/repository/user/userRepositoryMock";
import {v4 as uuid} from "uuid";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, NotFoundError} from "routing-controllers";
import {describe} from "mocha";
import { config } from "@config/config";
import sinon from "sinon";
import {expect} from "chai";
import {generateValidUserModel} from "@tests/seed/fakeModels";

describe("Sg Users Controller Tests", () => {
    let sgUsersController: SGUsersController;
    let userRepositoryMock: UserRepositoryMock;

    beforeEach(() => {
        sgUsersController = new SGUsersController();
        sgUsersController.userModel = userRepositoryMock = new UserRepositoryMock();
    });

    describe("getUser endpoint", () => {
        it("if the journal id doesn't match the current journal id then a BadRequestError is thrown", async () => {
            const id = `${uuid()}:t20`;

            await expectThrowsAsync(BadRequestError, async () => await sgUsersController.getUser(id));
        });

        it("if no user is returned a BadRequestError is thrown", async () => {
            const id = `${uuid()}:${config.journalId}`;

            userRepositoryMock.getOne.returns(null);

            await expectThrowsAsync(NotFoundError,
                async () => await sgUsersController.getUser(id));
        });

        it("returns the details of the user", async () => {
            const id = `${uuid()}:${config.journalId}`;
            const user = generateValidUserModel();

            userRepositoryMock.getOne.returns(user);

            const result = await sgUsersController.getUser(id);

            expect(result).to.be.eql({
                status: "ok",
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                id: user.id,
                profilePictureUrl: `${config.backendUrl}/api/user/profile_picture?userId=${user.id}`
            });
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});