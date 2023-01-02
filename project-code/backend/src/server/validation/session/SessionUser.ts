import {IsDefined, IsEmail, Length} from "class-validator";
import {Expose} from "class-transformer";
import {UserRole} from "@models/user/userModel";

/**
 * Represents a session user.
 */
export class SessionUser {
    @IsDefined()
    @Expose()
    id: string;

    @Length(3)
    @IsDefined()
    @Expose()
    username: string;

    @IsEmail()
    @IsDefined()
    @Expose()
    email: string;

    @IsDefined()
    @Expose()
    firstName: string;

    @IsDefined()
    @Expose()
    lastName: string;

    @Expose()
    role: UserRole;

    @Expose()
    hasVerifiedEmail: boolean;
}