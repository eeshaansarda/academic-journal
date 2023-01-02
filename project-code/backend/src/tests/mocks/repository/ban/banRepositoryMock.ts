import BaseRepositoryMock from "@mocks/repository/baseRepositoryMock";
import sinon from "sinon";
import {IBan, IBanRepository} from "@models/ban/banModel";

export default class BanRepositoryMock extends BaseRepositoryMock<IBan> implements IBanRepository {
    getBans = sinon.stub();
    numDocuments = sinon.stub();
    deleteExpiredBans = sinon.stub();
}