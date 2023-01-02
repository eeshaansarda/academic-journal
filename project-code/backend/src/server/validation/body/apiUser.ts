import {IsDefined, IsEmail, IsEnum, Length} from "class-validator";
import {IUser, UserRole} from "@models/user/userModel";
import {Expose} from "class-transformer";

/**
 * Represents the body of a request of a user attempting to login.
 */
export class ApiLoginUser {
    @IsDefined()
    @IsEmail()
    email: string;

    @IsDefined()
    @Length(4, 20)
    password: string;
}

/**
 * Represents the body of a request of a user attempting to register.
 */
export class ApiRegisterUser {
    @IsDefined()
    @IsEmail()
    email: string;

    @IsDefined()
    @Length(4, 20)
    password: string;

    @IsDefined()
    @Length(4)
    username: string;

    @IsDefined()
    firstName: string;

    @IsDefined()
    lastName: string;
}

export const getField = (field: any, fieldVisibility: boolean) => fieldVisibility ? field : undefined;

/**
 * Represents a publicly accessible user.
 */
export class PublicApiUser {
    @IsDefined()
    @Expose()
    id: string;

    @IsDefined()
    @Expose()
    username: string;

    @IsEmail()
    @Expose()
    email?: string;

    @IsDefined()
    @Expose()
    firstName?: string;

    @IsDefined()
    @Expose()
    lastName?: string;

    @IsDefined()
    @Expose()
    hasVerifiedEmail: boolean;

    @IsDefined()
    @IsEnum(UserRole)
    role: UserRole;

    @IsDefined()
    @Expose()
    institution?: string;

    @IsDefined()
    @Expose()
    biography?: string;

    @IsDefined()
    @Expose()
    twitter?: string;

    @IsDefined()
    @Expose()
    facebook?: string;

    @IsDefined()
    @Expose()
    linkedIn?: string;

    @IsDefined()
    @Expose()
    team: string;

    /**
     * Creates a publicly accessible user (to be returned from the API) from 
     * a stored user.
     * @param document The stored user.
     * @returns The user.
     */
    public static createPublicApiUserFromDocument(document: IUser): PublicApiUser {
        const fieldVisibility = document.profile.fieldVisibility;

        return {
            email: getField(document.email, fieldVisibility.email),
            id: document.id,
            team: document.journalInfo.homeJournal,
            firstName: getField(document.firstName, fieldVisibility.firstName),
            lastName: getField(document.lastName, document.profile.fieldVisibility.lastName),
            username: document.username,
            role: document.role,
            hasVerifiedEmail: document.hasVerifiedEmail,
            institution: getField(document.profile.institution, document.profile.fieldVisibility.institution),
            biography: getField(document.profile.biography, document.profile.fieldVisibility.biography),
            ...document.profile.socialMedia
        };
    }
}

/**
 * Represents a user.
 */
export class ApiUser {
    @IsDefined()
    @Expose()
    id: string;

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

    @IsEnum(UserRole)
    @Expose()
    role: UserRole;

    @Expose()
    hasVerifiedEmail: boolean;

    @Expose()
    homeJournal: string;

    profilePictureUrl: string;

    /**
     * Creates a user (to be returned from the API) from a stored user.
     * @param document The stored user.
     * @returns The user.
     */
    public static createApiUserFromDocument(document: IUser): ApiUser {
        return {
            email: document.email,
            id: document.id,
            firstName: document.firstName,
            lastName: document.lastName,
            role: document.role,
            hasVerifiedEmail: document.hasVerifiedEmail,
            homeJournal: document.journalInfo.homeJournal,
            username: document.username,
            profilePictureUrl: document.profile.profilePicture.url
        };
    }
}