export interface Ban {
    id: string;
    reason: string;
    subject: { id: string, username: string };
    issuer: { id: string, username: string };
    expiry: number;
}
