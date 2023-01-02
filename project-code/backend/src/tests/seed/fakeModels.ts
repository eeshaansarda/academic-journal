import {BanModel} from "@models/ban/banModel";
import {v4, v4 as uuidv4} from "uuid";
import faker from "faker";
import {IUser, UserModel, UserRole} from "@models/user/userModel";
import {IReview, ReviewDecision, ReviewModel} from "@models/review/reviewModel";
import {ISubmission, SubmissionModel} from "@models/submission/submissionModel";
import {ReportStatus} from "@validation/body/apiReport";
import {ReportModel} from "@models/report/reportModel";
import mongoose from "mongoose";
import {CommentModel, IComment} from "@models/comment/commentModel";
import { config } from "@config/config";
import {generateUser} from "@tests/seed/fakeData";
import {IVersion} from "@models/submission/version/versionModel";
import {ISupportingDocument} from "@models/submission/supportingDocument/supportingDocumentModel";
import {NotificationModel, NotificationType} from "@models/notification/notificationModel";

export function createBanModel(subject: IUser, issuer: IUser) {
    return new BanModel({
        id: uuidv4(),
        reason: faker.random.words(),
        subject: subject,
        issuer: issuer,
        expiry: faker.date.future()
    });
}

export function createReviewModel(submission: ISubmission, owner: IUser): IReview {
    return new ReviewModel({
        submissionId: submission._id,
        owner: owner._id,
        reviewId: uuidv4(),
        status: {
            decision: ReviewDecision.UNDETERMINED,
            verdict: faker.random.words()
        },
        version: submission.versions[0].version
    });
}

export function createVersionModel(): Partial<IVersion> {
    return {
        fileName: faker.random.word(),
        version: faker.random.word(),
        directory: v4()
    }
}

export function createReportModel(subject: IUser, reporter: IUser, status = ReportStatus.ACTIVE) {
    return new ReportModel({
        id: uuidv4(),
        reason: faker.random.words(),
        status: status,
        subject: subject,
        reporter: reporter
    });
}

export function generateValidCommentModel() {
    return {
        submission: uuidv4(),
        commenter: generateUser(),
        payload: faker.random.words(),
        pathToFile: faker.random.word(),
        postedAt: faker.date.recent()
    } as Partial<IComment>;
}

export function generateValidSubmissionModel() {
    return new SubmissionModel({
        directory: uuidv4(),
        description: faker.random.words(),
        title: faker.random.word(),
        author: new mongoose.Types.ObjectId(),
        fileName: faker.random.word(),
        published: false,
        versions: [{ version: uuidv4(), directory: uuidv4(), fileName: faker.random.word() }],
        coAuthors: []
    });
}

export function generateValidPublicationModel() {
    const submission = generateValidSubmissionModel();
    submission.published = true;
    return submission;
}

export function generateValidSupportingDocumentModel(): Partial<ISupportingDocument> {
    return {
        fileName: faker.random.word(),
        id: v4()
    };
}

export function generateValidSubmissionModelWithAuthor(author: mongoose.Types.ObjectId) {
    return new SubmissionModel({
        directory: v4(),
        description: faker.random.words(),
        title: faker.random.word(),
        author: author,
        fileName: faker.random.word(),
        published: false,
        versions: [{ version: uuidv4(), directory: uuidv4(), fileName: faker.random.word() }]
    });
}

export function generatePublicationWithAuthor(author: mongoose.Types.ObjectId) {
    const model = generateValidSubmissionModelWithAuthor(author);
    model.published = true;
    return model;
}


export function generateUserModelWithRole(role: UserRole) {
    const user = generateValidUserModel();
    user.role = role;
    return user;
}

export function generateValidUserModel() {
    return new UserModel({
        id: uuidv4(),
        username: faker.internet.userName() + "1234",
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: '$PazzWord123',
        role: UserRole.USER,
        profile: {
            profilePictureFileName: '',
            fieldVisibility: {
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
                institution: true,
                biography: true
            }
        },
        journalInfo: {
            homeJournal: config.journalId
        },
        dashboard: "",
        hasVerifiedEmail: true
    });
}

export function createCommentModel(commenter: IUser) {
    let start = faker.datatype.number();

    return new CommentModel({
        commenter,
        payload: faker.random.words(),
        postedAt: faker.date.recent(),
        anchor: {
            start,
            end: faker.datatype.number({ min: start + 1 })
        },
        parentId: 0,
        pathToFile: faker.random.word(),
        commentId: faker.datatype.number(),
    });
}

export function generateNotificationModel(id = 0) {
    return new NotificationModel({
        id,
        message: faker.random.words(),
        seen: false,
        user: v4(),
        type: NotificationType.PUBLICATION
    });
}