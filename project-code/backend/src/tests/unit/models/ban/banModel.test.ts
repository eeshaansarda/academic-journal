import {describe} from "mocha";
import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {BanModel} from "@models/ban/banModel";
import {expect} from "chai";
import {createBanModel, generateValidUserModel} from "@tests/seed/fakeModels";
import {IUser} from "@models/user/userModel";
import moment from "moment";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});

describe("Ban Model Tests", () => {
    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    describe("Get Bans Tests", () => {
        it("returns an empty list when there are no bans", async () => {
            const result = BanModel.getBans(0);
            expect(result).to.be.empty;
        });

        it("returns all of the bans when the number of bans is less than the page size", async () => {
            const subject = generateValidUserModel();
            const issuer = generateValidUserModel();
            await subject.save()
            await issuer.save();

            const bans = Array.from(Array(9)).map(_ => createBanModel(subject, issuer));
            for (const ban of bans) {
                await ban.save();
            }

            const result = await BanModel.getBans(0);
            expect(result.length).to.be.eql(9);
        });

        it("returns a number of reports equal to the page size if the number of reports is greater than the page size", async () => {
            const subject = generateValidUserModel();
            const issuer = generateValidUserModel();
            await subject.save();
            await issuer.save();

            const bans = Array.from(Array(11)).map(_ => createBanModel(subject, issuer));
            for (const ban of bans) {
                await ban.save();
            }

            const result = await BanModel.getBans(0);
            expect(result.length).to.be.eql(10);
        });

        it("returns the last page", async () => {
            const subject = generateValidUserModel();
            const issuer = generateValidUserModel();
            await subject.save(); 
            await issuer.save();

            const bans = Array.from(Array(11)).map(_ => createBanModel(subject, issuer));
            for (const ban of bans) {
                await ban.save();
            }

            const result = await BanModel.getBans(2);
            expect(result.length).to.be.eql(1);
        });

        it("populates the subject and issuer", async () => {
            const subject = generateValidUserModel();
            const issuer = generateValidUserModel();
            await subject.save(); 
            await issuer.save();

            const bans = Array.from(Array(2)).map(_ => createBanModel(subject, issuer));
            for (const ban of bans) {
                await ban.save();
            }

            const result = await BanModel.getBans(0);
            const subjectAndIssuerDefined = result.every(ban => {
                const subject = ban.subject as IUser;
                const issuer = ban.issuer as IUser;

                return subject && issuer;
            });

            expect(subjectAndIssuerDefined).to.be.true;
        });
    });

    describe ("deleteExpiredBans tests", () => {
        it ("deletes all bans before that have expired", async () => {
            const subject = generateValidUserModel();
            const issuer = generateValidUserModel();
            await subject.save();
            await issuer.save();

            const bans = [createBanModel(subject, issuer), createBanModel(subject, issuer), createBanModel(subject, issuer)];
            bans.forEach(ban => ban.expiry = moment().subtract(7, 'd').toDate() as any)
            for (const ban of bans) {
                await ban.save();
            }

            await BanModel.deleteExpiredBans();

            const bansReturned = await BanModel.find();
            expect(bansReturned).to.be.empty;
        });
    });
});