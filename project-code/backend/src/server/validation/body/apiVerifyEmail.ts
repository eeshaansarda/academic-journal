import { IsDefined } from "class-validator";

/**
 * Represents the body of a request to verify a user's email.
 */
export class ApiVerifyEmail {
    @IsDefined()
    id: string;

    @IsDefined()
    token: string;
}