import {IsEmail} from "class-validator";

/**
 * Represents the body of a request to change a user's profile fields.
 */
export class ApiChangeFields {
    @IsEmail({ required: false })
    email?: string;

    firstName?: string;

    lastName?: string;

    institution?: string;

    biography?: string;

    twitter?: string;

    facebook?: string;

    linkedIn?: string;
}