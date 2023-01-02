import sinon from "sinon";
import BaseRepositoryMock, {LookUpBaseRepository} from "@mocks/repository/baseRepositoryMock";
import {IUser, IUserRepository} from "@models/user/userModel";

export default class UserRepositoryMock extends BaseRepositoryMock<IUser> implements IUserRepository{
    createHomeUser = sinon.stub();
    doesHomeUserExist = sinon.stub();
    getUsers = sinon.stub();
    getHomeUserFromEmail = sinon.stub();
    getUserFromId = sinon.stub();
    numDocuments = sinon.stub();
    removeBan = sinon.stub();
    createFromApiUser = sinon.stub();
    findByAuthor = sinon.stub();
    setDashboard = sinon.stub();
}

export class UserLookUpRepository extends LookUpBaseRepository<IUser> implements IUserRepository {
    createHomeUser = sinon.stub();
    doesHomeUserExist = sinon.stub();
    getHomeUserFromEmail = sinon.stub();
    getUserFromId = sinon.stub();
    getUsers = sinon.stub();
    numDocuments = sinon.stub();
    removeBan = sinon.stub();
    createFromApiUser = sinon.stub();
    findByAuthor = sinon.stub();
    setDashboard = sinon.stub();
}