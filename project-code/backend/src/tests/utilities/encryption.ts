import NodeRSA from "node-rsa";

export default class Encryptor {
    private encryptionKey: NodeRSA;
    
    /**
     * Creates a new encryptor.
     * @param publicKey The public key as a hex string.
     */
    constructor(publicKey: string) {
        this.encryptionKey = new NodeRSA().importKey({
            n: Buffer.from(publicKey, 'hex'),
            e: 65537
        });
    }

    /**
     * Encrypts plain text data to an encrypted hex string.
     * @param plainText The plain text data.
     * @returns The encrypted hex string.
     */
    encrypt(plainText: string): string {
        const encrypted = this.encryptionKey.encrypt(plainText);
        return encrypted.toString('hex');
    }
}