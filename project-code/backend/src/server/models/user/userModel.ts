import {Document, FilterQuery, model, Model, Schema, UpdateQuery} from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from "@config/config";
import {v4 as uuidv4} from 'uuid';
import {ApiRegisterUser, ApiUser} from "@validation/body/apiUser";
import {BaseRepository} from "@models/baseRepository";
import {BanModel, IBan} from "@models/ban/banModel";
import {UsersQuery} from "@validation/query/usersQuery";
import {escapeRegExp} from "lodash";
import {ISubmission} from "@models/submission/submissionModel";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 4;

/**
 * Represents a user's general role.
 */
export enum UserRole {
    USER,
    ADMIN,
    EDITOR
}

export interface IUser extends Document {
    id: string;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    hasVerifiedEmail: boolean;
    profile: {
        profilePicture: {
            url: string;
            fileType: string;
        },
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
            profilePicture: boolean;
            institution: boolean;
            biography: boolean;
        }
    },
    journalInfo: {
        homeJournal: string;
    },
    dashboard: string;
    theme: string;
    checkPassword: (password: string) => Promise<boolean>;
    isHomeUser: () => boolean;
    isBanned: () => Promise<boolean>;
    getBans: () => Promise<IBan[]>;
}

export type IUserModel = IUserRepository & Model<IUser>;

export interface IUserRepository extends BaseRepository<IUser> {
    doesHomeUserExist: (email: string) => Promise<boolean>;
    createHomeUser: (user: ApiRegisterUser, password: string) => Promise<IUser>;
    getUsers: (usersQuery: UsersQuery, pageSize?: number) => Promise<[number, IUser[]]>;
    getUserFromId: (id: string) => Promise<IUser>;
    getHomeUserFromEmail: (email: string) => Promise<IUser>;
    numDocuments: () => Promise<number>;
    removeBan: (ban: IBan) => Promise<void>;
    createFromApiUser: (user: ApiUser) => Promise<IUser>;
    findByAuthor: (pageNumber: number, author: string) => Promise<ISubmission[]>;
    setDashboard: (userId: string, dashboard: string) => Promise<void>;
}

/**
 * The user schema.
 */
const userSchema = new Schema<IUser, IUserModel>({
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, index: true, trim: true },
    password: { type: String, required: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: Number, required: true },
    hasVerifiedEmail: { type: Boolean, required: true },
    profile: {
        profilePicture: {
            url: { type: String, required: false, default: 'https://avatars.githubusercontent.com/u/23016414?s=200&v=4'},
            fileType: { type: String }
        },
        institution: { type: String, required: false, trim: true },
        biography: { type: String, required: false, trim: true },
        socialMedia: {
            twitter: { type: String, required: false, trim: true },
            facebook: { type: String, required: false, trim: true },
            linkedIn: { type: String, required: false, trim: true }
        },
        fieldVisibility: {
            firstName: { type: Boolean, required: true },
            lastName: { type: Boolean, required: true },
            email: { type: Boolean, required: true },
            profilePicture: { type: Boolean, required: true },
            institution: {   type: Boolean, required: true },
            biography: { type: Boolean, required: true }
        }
    },
    journalInfo: {
        homeJournal: { type: String, required: true, trim: true }
    },
    dashboard: { type: String },
    theme: { type: String, default: 't15' }
});
userSchema.index({ email: 1, "journalInfo.homeJournal": 1 }, { unique: true });

/**
 * Checks if a password is valid.
 * @param password The password.
 * @returns Whether the password is valid.
 */
const isValidPassword = (password: string): boolean => {
    return password.length >= MIN_PASSWORD_LENGTH && password !== password.toLowerCase()
        && password !== password.toUpperCase() && !!password.match(/\d/);
}

export class UsernameError extends Error {}
export class InvalidPasswordError extends Error{}

/**
 * Hook that performs extra validation. Ensures that the username is of 
 * a suitable length and that a valid password has been provided.
 */
userSchema.pre('validate', function(this: IUser, next: any): void {
    if (this.username.length < 4) {
        throw new UsernameError('Username must be at least 4 characters');
    }

    if (!this.password && this.isHomeUser()) {
        throw new InvalidPasswordError('Home journal users must provide a password');
    }
    if (this.password && !isValidPassword(this.password)) {
        throw new InvalidPasswordError('Invalid password');
    }

    next();
});

/**
 * Generates a random number between min and max.
 * @param min The minimum number.
 * @param max The maximum number.
 * @returns The random number.
 */
function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1));
}

/**
 * Hashes a password using bcrypt.
 * @param password The password.
 * @returns The password hash.
 */
async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
}

/**
 * Transforms a password hash. Performs an XOR cipher then pads with 
 * random characters.
 * @param hash The password hash.
 * @returns The transformed password hash.
 */
function transformHash(hash: string): string {
    let transformed = hash
        .split('')
        .map(c => String.fromCharCode(c.charCodeAt(0) ^ 56))
        .join('');

    const paddingAmount = randomNumber(5, 10);
    for (let i=0; i<paddingAmount; i++) {
        transformed += String.fromCharCode(65 + randomNumber(0, 57));
    }

    return encodeURIComponent(transformed);
}

/**
 * Hashes the password of a given user.
 * @param user The given user.
 * @param next The 'next' function in the pipeline.
 */
export async function hashUserPassword(user: IUser, next: any): Promise<void> {
    if (!user.isModified('password')) {
        return next();
    }

    try {
        const hash = await hashPassword(user.password);
        user.password = transformHash(hash);

    } catch (err) {
        return next(err);
    }

    return next();
}


/**
 * Hook that hashes the user's password (if it has changed) before the user 
 * is saved.
 */
userSchema.pre('save', async function (this: IUser, next): Promise<void> {
    await hashUserPassword(this, next);
});

/**
 * Checks if a given password matches a user's stored password (by comparing
 * the hashes).
 * @param this The user.
 * @param password The password to check.
 * @returns Promise that resolves with whether the password matches.
 */
userSchema.methods.checkPassword = async function (this: IUser, password: string) {
    const transformedHash = decodeURIComponent(this.password).substring(0, 60);
    const passwordHash = transformedHash
        .split('')
        .map(c => String.fromCharCode(c.charCodeAt(0) ^ 56))
        .join('');

    return await bcrypt.compare(password, passwordHash);
};

/**
 * Checks whether a user is banned.
 * @param this The user.
 * @returns Promise that resolves with whether the user is banned.
 */
userSchema.methods.isBanned = async function (this: IUser) {
    return BanModel.exists({ subject: this._id });
}

/**
 * Get the bans associated with the user
 */

/**
 * Gets the bans of which a specific user is the subject.
 * @param this The user.
 * @returns Promise that resolves with the list of bans for the user.
 */
userSchema.methods.getBans = function (this: IUser) {
    return BanModel.find({ subject: this._id })
        .sort( { expiry: -1 });
}

/**
 * Checks if a user is a home user of this journal.
 * @param this The user.
 * @returns Whether the user is a home user.
 */
userSchema.methods.isHomeUser = function (this: IUser) {
    return this.journalInfo.homeJournal === config.journalId;
}

/**
 * Checks whether the user already exists in the document.
 *
 * @param email the email the user provided
 */

/**
 * Checks if a home user exists with a given email.
 * @param email The email.
 * @returns Promise that resolves with whether the user exists.
 */
userSchema.statics.doesHomeUserExist = async function (email: string) {
    const userInDB = await UserModel.findOne({ email, "journalInfo.homeJournal": config.journalId});
    return userInDB !== null;
}

/**
 * Creates a new user.
 * @param user The API user.
 * @param password The password.
 * @returns Promise that resolves with the created user.
 */
userSchema.statics.createHomeUser = async function (user: ApiRegisterUser, password: string) {
    const userModel = new UserModel({
        id: `${uuidv4()}:${config.journalId}`,
        username: user.username,
        email: user.email,
        password: password,
        firstName: user.firstName,
        lastName: user.lastName,
        role: UserRole.USER,
        hasVerifiedEmail: false,
        profile: {
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
            homeJournal: config.journalId
        }
    });

    await userModel.save();
    return userModel;
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Gets a list of users.
 * @param usersQuery The query.
 * @param pageSize The number of users on a page.
 * @returns Promise that resolves with the number and list of users.
 */
userSchema.statics.getUsers = async function(usersQuery: UsersQuery, pageSize: number = DEFAULT_PAGE_SIZE) {
    const { pageNumber, username = "", sort } = usersQuery;

    const searchObject: FilterQuery<IUser> = {};
    const pageIndex = Math.max(0, pageNumber - 1);

    if (username.trim() !== "")
        searchObject.username = { $regex: "^" + escapeRegExp(username) + ".*", $options: 'i' };

    const numDocuments = await UserModel.countDocuments(searchObject);

    const users =  await UserModel.find(searchObject)
        .sort({ username: sort })
        .skip(pageIndex * pageSize)
        .limit(pageSize)
        .exec();

    return [numDocuments, users];
}

/**
 * Finds a user by ID.
 * @param id The ID.
 * @returns Promise that resolves with the found user.
 */
userSchema.statics.getUserFromId = async function (id: string) {
    return UserModel.findOne({ id });
}

/**
 * Finds a user by email.
 * @param email The email.
 * @returns Promise that resolves with the found user.
 */
userSchema.statics.getHomeUserFromEmail = function (email: string) {
    return UserModel.findOne({ email, "journalInfo.homeJournal": config.journalId });
}

/**
 * Counts the number of users.
 * @returns Promise that resolves with the number of users.
 */
userSchema.statics.numDocuments = () => UserModel.countDocuments();

/**
 * Gets a user.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the user.
 */
userSchema.statics.getOne = (filterQuery: FilterQuery<IUser>) => UserModel.findOne(filterQuery);

/**
 * Gets a list of users.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of users.
 */
userSchema.statics.get = (filterQuery: FilterQuery<IUser>) => UserModel.find(filterQuery);

/**
 * Checks if a user exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with whether the user exists.
 */
userSchema.statics.docExists = (filterQuery: FilterQuery<IUser>) => !!UserModel.findOne(filterQuery);

/**
 * Modifies a user.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified user.
 */
userSchema.statics.modifyOne = (filterQuery: FilterQuery<IUser>, updateQuery: UpdateQuery<IUser>) => UserModel.updateOne(filterQuery, updateQuery);

/**
 * Removes a user.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed user.
 */
userSchema.statics.removeOne = (filterQuery: FilterQuery<IUser>) => UserModel.deleteOne(filterQuery);

/**
 * Creates a new user.
 * @param data The user data.
 * @returns Promise that resolves with the created user.
 */
userSchema.statics.createOne = async function (data: Partial<IUser>) {
    let model = new UserModel(data);
    await model.save();
    return model;
}

/**
 * Removes a ban for a user.
 * @param ban The ban.
 */
userSchema.statics.removeBan = async function (ban: IBan) {
    const userModel = await UserModel.findOne({ _id: ban.subject });
    if (userModel) {
        await userModel.save();
    }
    await BanModel.deleteOne({ _id: ban._id });
};

/**
 * Creates a user from an API user.
 * @param user The API user.
 * @returns Promise that resolves with the created user.
 */
userSchema.statics.createFromApiUser = async function (user: ApiUser) {
    const team = user.id.slice(-3);

    const userModel = new UserModel({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasVerifiedEmail: false,
        profile: {
            profilePicture: { url: user.profilePictureUrl },
            institution: '',
            biography: '',
            socialMedia: {
                twitter: '',
                facebook: '',
                linkedIn: ''
            },
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
        }
    });

    await userModel.save();
    return userModel;
}

export class UserDoesNotExistError extends Error {}

/**
 * Sets a user's dashboard preferences.
 * @param userId The ID of the user.
 * @param dashboard The dashboard preferences.
 */
userSchema.statics.setDashboard = async function (userId: string, dashboard: string) {
    const user = await UserModel.findOne({ id: userId });

    if (!user)
        throw new UserDoesNotExistError("the specified user does not exist");

    user.dashboard = dashboard;
    await user.save();
}

export const UserModel = model<IUser, IUserModel>('User', userSchema);