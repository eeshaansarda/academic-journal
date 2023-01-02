import {Express} from "express";
import request from "supertest";
import {LOGIN_ENDPOINT} from "@tests/config/specificationEndpoints";
import {ApiLoginUser} from "@validation/body/apiUser";
import Encryptor from "@tests/utilities/encryption";
import fs from "fs";
import {ApiEncryptedBody} from "@validation/body/apiEncryptedBody";

export function encryptData(login: any): ApiEncryptedBody {
    const RSA_PUBLIC_KEY = fs.readFileSync('public.key').toString();
    const encryptor = new Encryptor(RSA_PUBLIC_KEY);
    const raw = JSON.stringify(login);
    return { data: encryptor.encrypt(raw) };
}

export default async function getLoginCookie(app: Express, login: ApiLoginUser) {
    const encryptedData = encryptData(login);

    const requestObj = await request(app)
        .post(LOGIN_ENDPOINT)
        .set('Content-Type', 'application/json')
        .send(encryptedData);

    return requestObj.headers['set-cookie'][0];
}
