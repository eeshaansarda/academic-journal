
import {FilterQuery, model, Model, Schema, UpdateQuery} from "mongoose";
import {IUser, UserDoesNotExistError, UserModel} from "@models/user/userModel";
import {BaseRepository} from "@models/baseRepository";
import {v4} from "uuid";
import {uniq} from "lodash";

export interface IMessage extends Document {
    sender: (Schema.Types.ObjectId | IUser);
    content: string;
}

export interface IPrivateDiscussion extends Document {
    id: string;
    users: (Schema.Types.ObjectId | IUser)[];
    host: (Schema.Types.ObjectId | IUser);
    messages: IMessage[];
}

export interface IPrivateDiscussionRepository extends BaseRepository<IPrivateDiscussion> {
    createMessage: (discussionId: string, authorId: string, contents: string) => Promise<IMessage>;
    getPrivateDiscussion: (userId: string, privateDiscussionId: string) => Promise<IPrivateDiscussion>;
    getPrivateDiscussionsForUser: (userId: string, pageNumber: number) => Promise<IPrivateDiscussion[]>;
    setUsers: (discussionId: string, hostId: string, users: string[]) => Promise<IUser[]>;
    numDocumentsForUser: (id: string) => Promise<number>;
}

export type IPrivateDiscussionModel = IPrivateDiscussionRepository & Model<IPrivateDiscussion>;

/**
 * The private message schema.
 */
const messageSchema = new Schema<IMessage, {}>({
    sender: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true, trim: true }
});

/**
 * The private discussion schema.
 */
const privateDiscussionSchema = new Schema<IPrivateDiscussion, IPrivateDiscussionRepository>({
    id: { type: String, required: true, unique: true, trim: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    host: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    messages: [messageSchema]
});

/**
 * Creates a private discussion.
 * @param data The private discussion data.
 * @returns Promise that resolves with the created private discussion.
 */
privateDiscussionSchema.statics.createOne = async function (data: Partial<IPrivateDiscussion>) {
    const privateDiscussion = new PrivateDiscussionModel({ ...data, id: v4() });
    await privateDiscussion.save();
    return privateDiscussion;
}

/**
 * Removes a private discussion.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed private discussion.
 */
privateDiscussionSchema.statics.removeOne = (filterQuery: FilterQuery<IPrivateDiscussion>) => PrivateDiscussionModel.deleteOne(filterQuery);

/**
 * Modifies a private discussion.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified private discussion.
 */
privateDiscussionSchema.statics.modifyOne = (filterQuery: FilterQuery<IPrivateDiscussion>, updateQuery: UpdateQuery<IPrivateDiscussion>) => PrivateDiscussionModel.updateOne(filterQuery, updateQuery);

/**
 * Gets a private discussion.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the private discussion.
 */
privateDiscussionSchema.statics.getOne = (filterQuery: FilterQuery<IPrivateDiscussion>) => PrivateDiscussionModel.getOne(filterQuery);

/**
 * Gets a list of private discussions.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of private discussions.
 */
privateDiscussionSchema.statics.get = (filterQuery: FilterQuery<IPrivateDiscussion>) => PrivateDiscussionModel.get(filterQuery);

/**
 * Checks whether a private discussion exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with a suitable private discussion exists.
 */
privateDiscussionSchema.statics.docExists = (filterQuery: FilterQuery<IPrivateDiscussionModel>) => PrivateDiscussionModel.exists(filterQuery);

export class DiscussionDoesNotExistError extends Error {}

/**
 * Creates a message within a private discussion.
 * @param privateDiscussionId The ID of the private discussion.
 * @param authorId The ID of the author of the comment.
 * @param contents The text content of the comment.
 * @returns Promise that resolves with the created message.
 */
privateDiscussionSchema.statics.createMessage = async function (privateDiscussionId: string, authorId: string, contents: string): Promise<IMessage> {
    const author = await UserModel.findOne( { id: authorId });

    if (!author)
        throw new UserDoesNotExistError("the poster does not exist");

    const message = {
        sender: author,
        content: contents
    };

    const privateDiscussion = await PrivateDiscussionModel.findOne({ id: privateDiscussionId, $or: [{"users": author._id}, {"host": author._id}] });
    if (!privateDiscussion)
        throw new DiscussionDoesNotExistError("the given private discussion does not exist");

    privateDiscussion.messages.push(message as IMessage);
    await privateDiscussion.save();

    return message as IMessage;
}

/**
 * Gets a private discussion.
 * @param userId The ID of the user.
 * @param privateDiscussionId The ID of the private discussion.
 * @returns Promise that resolves with the private discussion.
 */
privateDiscussionSchema.statics.getPrivateDiscussion = async function (userId: string, privateDiscussionId: string) {
    const user = await UserModel.findOne({ id: userId });

    if (!user)
        throw new UserDoesNotExistError("the given user does not exist");

    const discussion = PrivateDiscussionModel.findOne({
        $and: [
            {
                $or: [{"users": user._id}, {"host": user._id}],
            },
            {
                id: privateDiscussionId
            }
        ]
    });

    return discussion.populate('users')
        .populate('host')
        .populate({ path: 'messages', populate: { path: 'sender', model: 'User' } });
}

const PAGE_SIZE = 10;

/**
 * Gets a list of private discussions for a specific user.
 * @param userId The ID of the user.
 * @param pageNumber The page number.
 * @returns Promise that resolves with the list of private discussions for
 * the user.
 */
privateDiscussionSchema.statics.getPrivateDiscussionsForUser = async function (userId: string, pageNumber: number) {
    const user = await UserModel.findOne({ id: userId });

    const pageIndex = Math.max(0, pageNumber - 1);

    if (!user)
        throw new UserDoesNotExistError("the given user does not exist");

    return PrivateDiscussionModel.find({
        $or: [{users: user._id}, {host: user._id}]
    }).populate('users')
        .populate('host')
        .sort({ created_at: -1 })
        .skip(pageIndex * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec();
}

/**
 * Sets the users within a private discussion.
 * @param discussionId The ID of the private discussion.
 * @param hostId The ID of the host of the private discussion.
 * @param users Array of IDs of the users to set.
 * @returns Promise that resolves with the array of users set.
 */
privateDiscussionSchema.statics.setUsers = async function (discussionId: string, hostId: string, users: string[]): Promise<IUser[]> {
    const userDocs = await Promise.all(uniq(users).map(userId => UserModel.findOne({ id: userId })));
    const host = await UserModel.findOne({ id: hostId });

    if (!host || userDocs.some(user => user === null))
        throw new UserDoesNotExistError("the given user(s) / host does not exist");

    const discussion = await PrivateDiscussionModel.findOneAndUpdate({ id: discussionId, host: host._id }, { users: (userDocs as IUser[]).map(user => user._id) });

    if (!discussion)
        throw new DiscussionDoesNotExistError("the given discussion does not exist");

    return userDocs as IUser[];
}

/**
 * Counts the number of private discussions for a user.
 * @param id The ID of the user.
 * @returns Promise that resolves with the number of private discussions
 * for the user.
 */
privateDiscussionSchema.statics.numDocumentsForUser = async (id: string) => {
    const user = await UserModel.findOne({ id });

    if (!user)
        throw new UserDoesNotExistError("the given user does not exist");

    return PrivateDiscussionModel.countDocuments({ 
        users: {
            $elemMatch: {
                $eq: user._id
            }
        } 
    });
}

export const PrivateDiscussionModel = model<IPrivateDiscussion, IPrivateDiscussionModel>('PrivateDiscussion', privateDiscussionSchema);