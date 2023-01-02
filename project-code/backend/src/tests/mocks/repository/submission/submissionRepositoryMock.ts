import {ISubmission, ISubmissionRepository} from "@models/submission/submissionModel";
import BaseRepositoryMock from "@mocks/repository/baseRepositoryMock";
import sinon from "sinon";

export class SubmissionRepositoryMock extends BaseRepositoryMock<ISubmission> implements ISubmissionRepository {
    createSubmission = sinon.stub();
    findAndPopulate = sinon.stub();
    findByTitle = sinon.stub();
    getAndPopulate = sinon.stub();
    getOneAndPopulate = sinon.stub();
    numDocuments = sinon.stub();
    importSubmission = sinon.stub();
    assignCoAuthors = sinon.stub();
    assignReviewers = sinon.stub();
    publish = sinon.stub();
    getSubmissionWithVersion = sinon.stub();
    findPublishedByTitle = sinon.stub();
    getPublication = sinon.stub();
    getSubmissionsWithNoReviewers = sinon.stub();
    getFeaturedPublications = sinon.stub();
    getPublicationOfTheDay = sinon.stub();
    resetStats = sinon.stub();
}