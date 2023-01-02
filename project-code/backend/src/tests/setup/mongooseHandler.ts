import mongoose from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server";

export class MongoTestDB {
    private static memServer : MongoMemoryServer | null = null;

    static async startServer() {
        if (MongoTestDB.memServer)
            return;

        MongoTestDB.memServer = await MongoMemoryServer.create();
        await mongoose.connect(MongoTestDB.memServer.getUri());
    }

    static async stopServer() {
        if (!MongoTestDB.memServer)
            throw new Error('the server is not running');

        await mongoose.disconnect();
    }

    static async clearCollections() {
        if (!MongoTestDB.memServer)
            throw new Error('the server is not running');

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }

    static getDbUrl() : string {
        if (!this.memServer)
            throw new Error("server hasn't started");

        return this.memServer.getUri();
    }
}