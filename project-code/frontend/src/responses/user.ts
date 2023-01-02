import {UserRole} from "@role/role";

export interface IGetUsers {
    status: string;
    users: PublicUser[];
    numUsers: number;
}

export interface IUserIdentity {
    username: string;
    id: string;
}

/**
 * Represents a user's publicly accessible details
 */
export interface PublicUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    isBanned: boolean;
    role: UserRole;
}

/**
 * Represents a user's details. This consists of the username,
 * password, email, first name and last name.
 */
export interface User {
    id: string;
    username: string;
    password?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    hasVerifiedEmail: boolean;
    profile: {
        profilePictureFileName: string;
        institution: string;
        biography: string;
        socialMedia: {
            twitter: string;
            facebook: string;
            linkedIn: string;
        }
        fieldVisibility: {
            firstName: boolean;
            lastName: boolean;
            email: boolean;
            institution: boolean;
        }
    }
    homeJournal: string;
}