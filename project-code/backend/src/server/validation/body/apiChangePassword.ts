import {IsDefined, Length} from "class-validator";

/**
 * Represents the body of a request to change a user's password.
 */
export class ApiChangePassword {
    @IsDefined()
    currentPassword: string;

    @IsDefined()
    @Length(4, 20)
    newPassword: string;
}