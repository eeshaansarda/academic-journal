import { IsDefined, Length } from 'class-validator';

/**
 * Represents the body of a request to reset a forgotten password.
 */
export class ApiCompleteForgottenPassword {
    @IsDefined()
    id: string;
    
    @IsDefined()
    @Length(4, 20)
    newPassword: string;

    @IsDefined()
    token: string;
}