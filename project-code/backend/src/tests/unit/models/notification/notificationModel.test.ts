import {MongoTestDB} from "@tests/setup/mongooseHandler";
import {generateNotificationModel, generateValidUserModel} from "@tests/seed/fakeModels";
import {expectThrowsAsync} from "@tests/utilities/assertions";
import {NotificationDoesNotExistError, NotificationModel} from "@models/notification/notificationModel";
import {expect} from "chai";
import {describe} from "mocha";
import {v4} from "uuid";

before(async () => {
    await MongoTestDB.startServer();
});

after(async () => {
    await MongoTestDB.stopServer();
});

describe ("Notification Model Tests", () => {
    beforeEach(async () => {
        await MongoTestDB.clearCollections();
    });

    describe ("readNotification Tests", () => {
        it ("throws an error if the notification with the associated user does not exist", async () => {
            const notification = generateNotificationModel();
            await notification.save();

            const user = generateValidUserModel();
            await user.save();

            await expectThrowsAsync(NotificationDoesNotExistError,
                async () => await NotificationModel.readNotification(user.id, notification.id));
        });

        it ("sets the seen property of the notification if it exists", async () => {
            const notification = generateNotificationModel();

            const user = generateValidUserModel();
            await user.save();

            notification.user = user.id;
            await notification.save();


            await NotificationModel.readNotification(user.id, notification.id);
            expect((await NotificationModel.findById(notification._id))?.seen).to.be.true;
        });
    });

    describe ("getNotificationsInLastWeek Tests", () => {
        it ("returns an empty list if the user does not exist", async () => {
            const notifications = await NotificationModel.getNotificationsInLastWeek(v4());
            expect(notifications).to.be.empty;
        });

        it ("returns an empty list if the user has no notifications", async () => {
            const user = generateValidUserModel();
            await user.save();

            const notifications = await NotificationModel.getNotificationsInLastWeek(user.id);
            expect(notifications).to.be.empty;
        });

        it ("returns an empty list if the user has no notifications in the last week", async () => {
            const user = generateValidUserModel();
            await user.save();
        });

        it ("returns notifications in the last week", async () => {
            const user = generateValidUserModel();
            await user.save();

            const notifications = [generateNotificationModel(0), generateNotificationModel(1), generateNotificationModel(2)];
            notifications.forEach(n => n.user = user.id);

            for (const notification of notifications) {
                await notification.save();
            }

            const result = await NotificationModel.getNotificationsInLastWeek(user.id);
            expect(result.map(r => r.id)).to.have.members(notifications.map(r => r.id));
        });
    });
});