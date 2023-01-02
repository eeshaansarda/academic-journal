import sinon from "sinon";
import {BaseRepository} from "@models/baseRepository";
import {FilterQuery, UpdateQuery} from "mongoose";

export default class BaseRepositoryMock<T> implements BaseRepository<T> {
    docExists = sinon.stub();
    createOne = sinon.stub();
    removeOne = sinon.stub();
    get = sinon.stub();
    getOne = sinon.stub();
    modifyOne = sinon.stub();
}

export class LookUpBaseRepository<T> implements BaseRepository<T> {
    private store: T[] = [];

    async create(objs: Partial<T>[]) {
        const promises = objs.map(obj => this.createOne(obj));
        await Promise.all(promises);
    }

    async createOne(obj: Partial<T>): Promise<T> {
        this.store.push(obj as T);
        return obj as T;
    }

    async docExists(obj: FilterQuery<T>): Promise<boolean> {
        return await this.getOne(obj) !== null;
    }

    async get(obj: FilterQuery<T>): Promise<T[]> {
        let returnedValues = this.store;

        for (let key of Object.keys(obj)) {
            returnedValues = returnedValues.filter(val => (val as any)[key] === obj[key]);
        }

        return returnedValues;
    }

    async getOne(obj: FilterQuery<T>): Promise<T | null> {
        let returned = await this.get(obj);

        return returned.length === 0 ? null : returned[0];
    }

    async modifyOne(obj1: FilterQuery<T>, obj2: UpdateQuery<T>): Promise<T | null> {
        let value = await this.getOne(obj1);

        if (!value)
            return null;

        for (let key of Object.keys(obj2)) {
            (value as any)[key] = obj2[key];
        }

        return value;
    }

    async removeOne(obj: FilterQuery<T>): Promise<T | null> {
        let value = await this.getOne(obj);

        if (!value)
            return null;

        let index = this.store.indexOf(value);
        this.store.splice(index, 1);
        return value;
    }

}