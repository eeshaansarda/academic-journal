import {FilterQuery, UpdateQuery} from "mongoose";

export interface BaseRepository<T> {
    modifyOne(obj1: FilterQuery<T>, obj2: UpdateQuery<T>): Promise<T | null>;
    removeOne(obj: FilterQuery<T>): Promise<T | null>;
    createOne(obj: Partial<T>): Promise<T>;

    getOne(obj: FilterQuery<T>): Promise<T | null>;
    get(obj: FilterQuery<T>): Promise<T[]>;
    docExists(obj: FilterQuery<T>): Promise<boolean>;
}