import {IsDefined} from "class-validator";
import {UserRole} from "@models/user/userModel";

/**
 * Represents the body of a request to add a role to a user.
 */
export class ApiAddRole {
    @IsDefined()
    userId: string;

    @IsDefined()
    role: UserRole;
}