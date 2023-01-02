import {ISsoToken} from "@helper/sso/ssoToken";
import sinon from "sinon";

export class SsoTokenMock implements ISsoToken {
    checkSsoToken = sinon.stub();
    decodeSsoToken = sinon.stub();
    generateSsoToken = sinon.stub();
}