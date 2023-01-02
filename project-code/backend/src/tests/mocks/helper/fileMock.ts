import {IFileSender} from "@helper/file/file";
import sinon from "sinon";

export class FileSenderMock implements IFileSender {
    sendFile = sinon.stub();
}