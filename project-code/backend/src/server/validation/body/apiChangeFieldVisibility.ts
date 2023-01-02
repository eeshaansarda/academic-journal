import {IsBoolean, IsDefined, IsEnum} from 'class-validator';

export enum ProfileField {
    FirstName = 'firstName',
    LastName = 'lastName',
    Email = 'email',
    ProfilePicture = 'profilePicture',
    Institution = 'institution',
    Biography = 'biography'
}

/**
 * Represents the body of a request to change the visibility of a user's
 * profile fields.
 */
export class ApiChangeFieldVisibility {
    @IsDefined()
    @IsEnum(ProfileField)
    field: ProfileField;

    @IsDefined()
    @IsBoolean()
    visible: boolean;
}