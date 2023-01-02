import * as uuid from "uuid";
import * as faker from "faker";
import mongoose from "mongoose";
import {IUser, UserRole} from "@models/user/userModel";
import {ApiLoginUser, ApiRegisterUser, ApiUser} from "@validation/body/apiUser";
import {ApiComment, ApiGeneralComment} from "@validation/body/apiComments";
import sinon from "sinon";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiAssignReviewers, ApiDirectoryEntry, ApiSubmission} from "@validation/body/apiSubmission";
import {ApiExportSubmission} from "@validation/body/apiExportSubmission";
import {GetFileQuery} from "@validation/query/getFileQuery";
import {GetFileCommentsQuery, GetGeneralCommentsQuery} from "@validation/query/getCommentsQuery";
import _ from 'lodash';
import multer from 'multer';
import {GetMetadataHeader, GetSubmissionHeader} from "@validation/headers/apiPublicationHeaders";
import {ContentType} from "@helper/file/file";
import {SsoCallbackQuery, SsoConfirmQuery, SsoLoginQuery} from "@validation/query/ssoLoginQuery";
import {ApiReport, ReportStatus} from "@validation/body/apiReport";
import {ApiBan, ApiReportBan} from "@validation/body/apiBan";
import {ViewReportsQuery} from "@validation/query/viewReportsQuery";
import { config } from "@config/config";
import {IReview, ReviewDecision} from "@models/review/reviewModel";
import {ISubmission} from "@models/submission/submissionModel";
import {IComment} from "@models/comment/commentModel";
import {ApiPostReview, ApiReviewer, ApiReviewVerdict} from "@validation/body/apiReview";
import {ApiAddCoAuthor} from "@validation/body/apiAddCoAuthor";
import { GetProfilePictureQuery } from '@server/validation/query/getProfilePictureQuery';

export function getUserPair(): [SessionUser, Partial<IUser>] {
    const sessionUser: SessionUser = {
        id: uuid.v4(),
        username: 'johndoe',
        email: 'johndoe@test.com',
        firstName: 'John Doe',
        lastName: 'John Doe',
        role: UserRole.USER,
        hasVerifiedEmail: false
    };

    const userDocument: Partial<IUser> = {
        _id: new mongoose.Types.ObjectId(),
        ...sessionUser,
        password: 'PASSWORD_HASH',
        profile: {
            profilePicture: { 
                url: 'https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png',
                fileType: '.png'
             },
            institution: 'University of St. Andrews',
            biography: 'Hello there I am John Doe',
            socialMedia: {
                twitter: 'https://twitter.com/johndoe',
                facebook: 'https://facebook.com/johndoe',
                linkedIn: 'https://linkedin.com/johndoe'
            },
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
            homeJournal: 't15'
        },
        dashboard: '',
        theme: '',
        checkPassword: sinon.stub(),
        isHomeUser: sinon.stub(),
        isBanned: sinon.stub(),
        getBans: sinon.stub()
    };
    Object.defineProperties(userDocument, {
        'save': {
            value: sinon.stub()
        }
    });

    return [sessionUser, userDocument];
}

export function generateValidAPIComment() : ApiComment {
    const startAnchor = faker.datatype.number();

    return {
        anchor: { start:startAnchor, end: startAnchor + faker.datatype.number() }, pathToFile: faker.datatype.string(), reviewId: "",
        commenter: {
            userId: uuid.v4(),
            username: faker.internet.userName()
        },
        payload: faker.random.words(),
        commentId: faker.datatype.number(),
        commentMade: faker.date.recent().valueOf()
    };
}

export function generateValidAPICommentWithCommenter(commenter: IUser) : ApiComment {
    const comment = generateValidAPIComment();
    comment.commenter = {
        username: commenter.username,
        userId: commenter.id
    };
    return comment;
}


export function generateFakeUser() {
    return {
        id: uuid.v4(),
        role: UserRole.USER,
        email: faker.internet.email(),
        lastName: faker.name.lastName(),
        firstName: faker.name.firstName(),
        username: faker.internet.userName(),
        password: faker.random.word(),
        checkPassword: sinon.stub(),
        _id: new mongoose.Types.ObjectId(),
        save: sinon.stub(),
        isHomeUser: sinon.stub().returns(true),
        profile: {
            profilePicture: { 
                url: 'https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png',
                fileType: '.png'
             },
            institution: 'University of St. Andrews',
            biography: 'Hello there I am John Doe',
            socialMedia: {
                twitter: 'https://twitter.com/johndoe',
                facebook: 'https://facebook.com/johndoe',
                linkedIn: 'https://linkedin.com/johndoe'
            },
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
            homeJournal: 't15'
        },
    }
}

export function createSessionUser() : SessionUser {
    return {
        id: uuid.v4(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        role: UserRole.USER,
        username: faker.internet.userName(),
        hasVerifiedEmail: false
    };
}

export function generateValidApiUser(): Partial<ApiUser> {
    return {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        homeJournal: faker.random.word(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        role: UserRole.USER
    };
}

export function createSubmissionBody() {
    let submission = new ApiSubmission();
    submission.submissionId = uuid.v4();
    submission.fileName = faker.random.word();
    submission.description = faker.random.words();
    submission.initialVersion = faker.random.word();
    submission.title = faker.random.words();
    submission.published = faker.date.recent().toString();
    submission.author = createFakeAuthor();
    return submission;
}

export function createFakeAuthor() {
    return {
        id: uuid.v4(),
        username: faker.internet.userName()
    };
}

export function createFakeFile(): Partial<Express.Multer.File> {
    return {
        destination: `${uuid.v4()}.zip`,
        filename: 'example.txt'
    };
}

export function createFakeSubmission() {
    const author = new mongoose.Types.ObjectId();
    return {
        directory: uuid.v4(),
        fileName: faker.random.word(),
        author: author,
        description: faker.random.words(),
        title: faker.random.words(),
        getPath: sinon.stub(),
        performValidation: sinon.stub(),
        getReviews: sinon.stub(),
        allReviewsSubmitted: sinon.stub(),
        getReviewsForUser: sinon.stub(),
        created_at: faker.date.past(),
        getLatestVersion: sinon.stub().returns('some-version-name'),
        reviewers: [],
        versions: [
            {
                version: 'some-version-name',
                directory: '',
                fileName: ''
            }
        ],
        coAuthors: [author]
    };
}

export function createExportSubmissionBody() : ApiExportSubmission {
    return {
        id: uuid.v4(),
        url: faker.internet.url()
    }
}

export function generateGetFileQuery() : GetFileQuery {
    return {
        submissionId: uuid.v4(),
        pathToFile: faker.random.word()
    };
}

export function generateDirectoryEntry() : ApiDirectoryEntry {
    return {
        isDirectory: false,
        fileName: faker.random.word(),
        lastModification: faker.date.past()
    }
}

export function generateReview() {
    const comments : IComment[] = [];

    return {
        submissionId: generateSubmission() as ISubmission,
        reviewId: uuid.v4(),
        owner: generateUser() as IUser,
        comments: comments as any as [IComment],
        status: {
            decision: ReviewDecision.UNDETERMINED,
            verdict: ""
        },
        addGeneralComment: sinon.stub().callsFake(function (comment: ApiGeneralComment) {
            comments.push({
                payload: comment.payload
            } as IComment);
        }),
        addComment: sinon.stub().callsFake(function (comment: ApiComment) {
            comments.push({
                payload: comment.payload
            } as IComment);
        }),
        save: sinon.stub(),
        isDecisionReleased: function () {
            return this.status.decision !== ReviewDecision.UNDETERMINED
        }
    }
}

export function generateUser() {
    return {
        id: uuid.v4(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: '$PazzWordsdjssjq12313234232',
        role: UserRole.USER,
        profile: {
            profilePicture: {
                fileType: faker.random.word(),
                url: faker.internet.url()
            },
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
    } as Partial<IUser>;
}

export function generateSubmission() {
    return {
        directory: uuid.v4(),
        description: faker.random.words(),
        title: faker.random.word(),
        author: generateUser(),
        fileName: faker.random.word(),
        getAuthorIds: () => []
    } as Partial<ISubmission>;
}

export function generateReviewWithOwner() : Partial<IReview> & { created_at: Date } {
    return {
        submissionId: generateSubmission() as ISubmission,
        reviewId: uuid.v4(),
        owner: generateUser() as IUser,
        created_at: faker.date.recent(),
    };
}

export function generateCommenter() {
    return {
        username: faker.internet.userName(),
        userId: uuid.v4()
    };
}

export function generateCommentBody() : ApiComment {
    let start = faker.datatype.number();

    return {
        commentId: 0,
        reviewId: uuid.v4(),
        commentMade: faker.date.past().valueOf(),
        payload: faker.random.words(),
        commenter: generateCommenter(),
        pathToFile: faker.random.word(),
        anchor: {
            start,
            end: faker.datatype.number({ min: start + 1 })
        }
    }
}

export function generateGeneralCommentBody() : ApiGeneralComment {
    return {
        commentId: 0,
        reviewId: uuid.v4(),
        payload: faker.random.words(),
        commenter: generateCommenter()
    };
}

export function generateGetGeneralCommentsQuery() : GetGeneralCommentsQuery {
    return {
        reviewId: uuid.v4()
    };
}

export function generateGetFileCommentsQuery() : GetFileCommentsQuery {
    return {
        reviewId: uuid.v4(),
        pathToFile: faker.datatype.string()
    };
}

export function generateFakeComment() {
    let start = faker.datatype.number();

    return {
        commenter: {
            username: faker.internet.userName(),
            id: uuid.v4()
        },
        payload: faker.random.words(),
        postedAt: faker.date.recent(),
        anchor: {
            start,
            end: faker.datatype.number({ min: start + 1 })
        },
        parentId: 0,
        pathToFile: faker.random.word(),
        commentId: faker.datatype.number(),
    };
}

export function generateGetSubmissionHeader() : GetSubmissionHeader {
    return {
        'content-type': _.sample([ContentType.ZIP, ContentType.FILE]) ?? ContentType.ZIP,
        authorization: faker.datatype.string()
    };
}

export function generateMetaDataHeader() : GetMetadataHeader {
    return {
        authorization: faker.datatype.string()
    };
}

export function generateSsoLoginQuery() : SsoLoginQuery {
    return {
        from: faker.internet.url(),
        state: faker.datatype.string()
    }
}

export function generateConfirmSsoQuery() : SsoConfirmQuery {
    return {
        state: faker.datatype.string(),
        redirectUrl: faker.internet.url()
    };
}

export function generateCallBackQuery() : SsoCallbackQuery {
    return {
        token: faker.datatype.string(),
        state: faker.datatype.string(),
        from: faker.internet.url()
    };
}

export function generateApiReport() : ApiReport {
    return {
        id: uuid.v4(),
        reason: faker.random.words(),
        subject: { id: uuid.v4(), username: faker.datatype.string() },
        reporter: { id: uuid.v4(), username: faker.datatype.string() }
    };
}

export function createReport() {
    return {
        id: uuid.v4(),
        reason: faker.random.words(),
        status: ReportStatus.ACTIVE,
        subject: new mongoose.Types.ObjectId(),
        issuer: new mongoose.Types.ObjectId()
    };
}

export function createPopulatedReport() {
    return {
        id: uuid.v4(),
        reason: faker.random.words(),
        status: ReportStatus.ACTIVE,
        subject: generateFakeUser(),
        reporter: generateFakeUser(),
        save: sinon.stub()
    };
}

export function createApiReportBan() : ApiReportBan {
    return {
        expiry: faker.datatype.number(),
        reportId: uuid.v4(),
        reason: faker.random.words()
    }
}

export function createViewReportsQuery() : ViewReportsQuery {
    return {
        pageNumber: faker.datatype.number()
    }
}

export function createApiBan() : ApiBan {
    return {
        id: uuid.v4(),
        reason: faker.random.words(),
        expiry: faker.date.recent().getTime(),
        subject: { username: faker.random.words(), id: uuid.v4() },
        issuer: { username: faker.random.words(), id: uuid.v4() }
    }
}

export function createBan() {
    return {
        id: uuid.v4(),
        reason: faker.random.words(),
        subject: new mongoose.Types.ObjectId(),
        issuer: new mongoose.Types.ObjectId(),
        expiry: faker.date.future()
    }
}

export function createPopulatedApiBan() {
    return {
        id: uuid.v4(),
        reason: faker.random.words(),
        subject: generateFakeUser(),
        issuer: generateFakeUser(),
        expiry: faker.date.future()
    };
}

export function createApiRevokeBan() {
    return {
        id: uuid.v4()
    };
}

export function generateComment() : Partial<IComment> {
    return {
        commentId: 0,
        commenter: generateUser() as IUser,
        payload: faker.random.words(),
        pathToFile: faker.random.word(),
        postedAt: faker.date.recent(),
        id: faker.datatype.number(),
    };
}

export function generateApiReviewer() : ApiReviewer {
    return {
        username: faker.internet.userName(),
        id: uuid.v4()
    };
}

export function generateApiReviewVerdict(): ApiReviewVerdict {
    return {
        reviewId: uuid.v4(),
        comment: faker.random.words(),
        decision: ReviewDecision.READY
    };
}

export function generateApiAddCoAuthor() : ApiAddCoAuthor {
    return {
        submissionId: uuid.v4(),
        userIds: [uuid.v4()]
    };
}

export function generateApiAssignReviewer() : ApiAssignReviewers {
    return {
        submissionId: uuid.v4(),
        reviewers: [uuid.v4()]
    };
}

export function generateProfilePictureQuery(user: SessionUser): GetProfilePictureQuery {
    return {
        userId: user.id
    };
}

export function createApiRegisterUser(): ApiRegisterUser {
    return {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: '$ValidPassword123',
        email: faker.internet.email()
    }
}

export function createApiLoginUser(): ApiLoginUser {
    return {
        email: faker.internet.email(),
        password: '$ValidPasswordThing123'
    };
}

export function createApiPostReview(): ApiPostReview {
    return {
        submissionId: uuid.v4()
    };
}

export function createFakeMulterFile(): Partial<Express.Multer.File> {
    return {
        filename: faker.random.word(),
        destination: `${uuid.v4()}.zip`
    };
}
