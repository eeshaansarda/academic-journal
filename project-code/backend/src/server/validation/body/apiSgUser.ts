import {IsDefined, IsEmail} from "class-validator";
import {IUser, UserModel, UserRole} from "@models/user/userModel";

/**
 * Represents the user schema (in the supergroup format).
 */
export class ApiSgUserSchema {
    @IsDefined()
    name: string;

    @IsDefined()
    @IsEmail()
    email: string;

    @IsDefined()
    id: string;

    /**
     * Converts a user in supergroup format to a new user model.
     * @param userSchema The supergroup user.
     * @returns The new user model.
     */
    public static convertToUserModel(userSchema: ApiSgUserSchema): IUser {
        const [firstName, lastName] = userSchema.name.split(" ");
        const team = userSchema.id.slice(-3);

        return new UserModel({
            id: userSchema.id,
            username: userSchema.name.split(" ").join("-"),
            email: userSchema.email,
            firstName: firstName,
            lastName: lastName,
            role: UserRole.USER,
            profile: {
                profilePictureFileName: '',
                fieldVisibility: {
                    firstName: true,
                    lastName: true,
                    email: false,
                    profilePicture: true,
                    institution: true,
                    biography: true
                }
            },
            journalInfo: {
                homeJournal: team
            },
            hasVerifiedEmail: true
        });
    }
}