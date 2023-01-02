import { Service } from "typedi";
import NodeRSA from 'node-rsa';
import fs from 'fs';

export interface IDecryptionService {
    decrypt(encryptedText: string): string;
}

@Service()
export default class DecryptionService implements IDecryptionService {
    private decryptionKey: NodeRSA;

    /**
     * Creates a new decryption service.
     */
    constructor() {
        const privateKey = fs.readFileSync('privateKey.pem').toString();
        this.decryptionKey = new NodeRSA().importKey(privateKey, 'pkcs1-private-pem');
    }

    /**
     * Decrypts text encrypted with the public key.
     * @param encryptedText The encrypted text as a hex string.
     * @returns The decrypted text as UTF-8 string.
     */
    decrypt(encryptedText: string): string {
        const encrypted = Buffer.from(encryptedText, 'hex');
        const decrypted = this.decryptionKey.decrypt(encrypted);
        return decrypted.toString('utf-8');
    }
}