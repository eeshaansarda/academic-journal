import {IBearerTokenVerifier} from "@helper/bearer/bearerToken";
import sinon from "sinon";

export class BearerTokenMock implements IBearerTokenVerifier {
    verifyBearerToken = sinon.stub();
}