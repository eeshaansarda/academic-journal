import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {describe} from "mocha";
import {AnnouncementModel} from "@models/announcements/announcementModel";
import faker from "faker";
import { v4 } from "uuid";
import ApiAnnouncement from "@validation/body/apiAnnouncement";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {UserDoesNotExistError} from "@models/user/userModel";
import {generateValidUserModel} from "@tests/seed/fakeModels";
import {expect} from "chai";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});

describe ("Announcement Model Tests", () => {
    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    function generateAnnouncement() {
        return {
            content: faker.random.words(),
            title: faker.random.words()
        }
    }

    describe ("createAnnouncement Tests", () => {
        it ("throws an error if the user does not exist", async () => {
            const createAnnouncement = () => AnnouncementModel.createAnnouncement(generateAnnouncement() as ApiAnnouncement, v4());
            await expectThrowsAsync(UserDoesNotExistError, createAnnouncement);
        });
    });

    describe ("getAnnouncement Tests", () => {

        it ("returns an empty list if there are no announcements", async () => {
            const user = generateValidUserModel();
            await user.save();

            const result = await AnnouncementModel.getAnnouncements({});
            expect(result).to.be.empty;
        });

        it ("returns the announcements in the last seven days", async  () => {
            const announcements = [generateAnnouncement(), generateAnnouncement()] as ApiAnnouncement[];

            const user = generateValidUserModel();
            await user.save();

            for (const announcement of announcements) {
                await AnnouncementModel.createAnnouncement(announcement, user.id);
            }

            const result = await AnnouncementModel.getAnnouncements({});
            expect(result.map(a => a.title)).to.have.members(announcements.map(a => a.title));
        });
    });
});