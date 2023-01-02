import BanController from "@controllers/api/ban/banController";
import BanRepositoryMock from "@mocks/repository/ban/banRepositoryMock";
import {UserLookUpRepository} from "@mocks/repository/user/userRepositoryMock";
import {
    createApiBan,
    createApiRevokeBan,
    createBan,
    createPopulatedApiBan,
    createSessionUser,
    generateFakeUser
} from "@tests/seed/fakeData";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {BadRequestError, NotFoundError} from "routing-controllers";
import {describe} from "mocha";
import {expect} from "chai";
import {ApiBan} from "@validation/body/apiBan";
import SocketService from "@server/services/socketService";

describe("Ban Controller Tests", () => {
    let banController: BanController;
    let banRepository: BanRepositoryMock;
    let userRepository: UserLookUpRepository;

    beforeEach(() => {
        banController = new BanController(new SocketService());
        banController.banModel = banRepository = new BanRepositoryMock();
        banController.userModel = userRepository = new UserLookUpRepository();
    });

    describe("banUser endpoint tests", () => {
        it("throws a NotFoundError if the specified user does not exist", async () => {
            const sessionUser = createSessionUser();
            const banQuery = createApiBan();

            await userRepository.create([sessionUser]);

            await expectThrowsAsync(NotFoundError,
                async () => await banController.banUser(sessionUser, banQuery));
        });

        it("throws a BadRequestError if we could not create a ban", async () => {
            const sessionUser = createSessionUser();
            const banQuery = createApiBan();
            const bannedUser = generateFakeUser();
            banQuery.id = bannedUser.id;

            await userRepository.create([sessionUser, bannedUser]);

            banRepository.createOne.throws(Error);

            await expectThrowsAsync(BadRequestError,
                async () => await banController.banUser(sessionUser, banQuery));
        });

        it("bans the user on success", async () => {
            const sessionUser = createSessionUser();
            const banQuery = createApiBan();
            const bannedUser = generateFakeUser();
            const ban = createBan();
            ban.id = banQuery.id;

            banQuery.id = bannedUser.id;

            await userRepository.create([sessionUser, bannedUser]);

            banRepository.createOne.returns(ban);
            const result = await banController.banUser(sessionUser, banQuery);

            expect(result.status).to.be.eql("success");
        });
    });

    describe("revokeBan endpoint tests", () => {
        it("Throws NotFoundError error if the ban does not exist", async () => {
            banRepository.getOne.returns(null);

            await expectThrowsAsync(NotFoundError,
                async () => await banController.revokeBan(createApiRevokeBan()));
        });

        it("returns success if the ban exists", async () => {
            const ban = createBan();
            const apiRevokeBan = { id: ban.id };

            banRepository.getOne.returns(ban);

            const result = await banController.revokeBan(apiRevokeBan);

            expect(result.status).to.be.eql("success");
        });
    });

    describe("viewBans endpoint tests", () => {
        it("returns an empty list if there are no bans", async () => {
            const getBansQuery = { pageNumber: 0 };

            banRepository.numDocuments.returns(0);
            banRepository.getBans.returns([]);

            const result = await banController.viewBans(getBansQuery);

            expect(result).to.be.eql({
                status: "success",
                bans: [],
                numBans: 0
            });
        });

        it("returns a list of all bans", async () => {
            const getBansQuery = { pageNumber: 0 };

            const bans = [createPopulatedApiBan(), createPopulatedApiBan(), createPopulatedApiBan()];
            const apiBans = bans.map(ban => ApiBan.createApiBanFromDocument(ban as any));

            banRepository.numDocuments.returns(bans.length);
            banRepository.getBans.returns(bans);

            const result = await banController.viewBans(getBansQuery);

            expect(result).to.be.eql({
                status: "success",
                bans: apiBans,
                numBans: bans.length
            });
        });
    });
});