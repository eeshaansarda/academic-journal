import { IsDefined } from "class-validator";

/**
 * Represents the encrypted body of a request.
 */
export class ApiEncryptedBody {
    @IsDefined()
    data: string;
}