import {ICookieProvider} from "@server/authorization/authorization";
import sinon from "sinon";

export class CookieProviderMock implements ICookieProvider {
    createSessionCookie = sinon.stub();
    genSessionCookie = sinon.stub();
    clearCookie = sinon.stub();
}