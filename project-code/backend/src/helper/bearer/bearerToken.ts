import jwt from "jsonwebtoken";

export interface IBearerTokenVerifier {
    verifyBearerToken(header: string): Promise<boolean>;
}

export class BearerTokenVerifier implements  IBearerTokenVerifier {

    /**
     * Verifies a bearer token header.
     * @param header The 'Authorization' bearer header.
     * @returns Promise that resolves with whether the bearer token is valid.
     */
    public async verifyBearerToken(header: string): Promise<boolean> {
        return new Promise<boolean>(res => {
            if (!header.startsWith('Bearer ')) {
                res(false);
            }

            const token = header.split('Bearer ')[1];
            jwt.verify(token, process.env.JWT_SECRET as string,
                err => {
                    if (err) {
                        res(false);
                    }
                    res(true);
                });
        });
    }

}