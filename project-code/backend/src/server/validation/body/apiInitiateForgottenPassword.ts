import { IsDefined, IsEmail } from 'class-validator';

/**
 * Represents the body of a request to initiate the reset password for a
 * user who has forgotten their password.
 */
export class ApiInitiateForgottenPassword {
    @IsDefined()
    @IsEmail()
    email: string;
}