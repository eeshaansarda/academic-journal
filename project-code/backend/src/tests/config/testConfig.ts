import {IConfig} from "@config/config";

export default function createTestConfig(dbUrl: string) : IConfig {
    return {
        dbUrl,
        baseSubmissionFolder: "./submissions",
        profilePictureFolder: "./profilePictures",
        backendUrl: "http://localhost:8080",
        journalUrl: "http://localhost:3000",
        journalId: "t15",
        buildDirectory: "../../../build"
    }
}