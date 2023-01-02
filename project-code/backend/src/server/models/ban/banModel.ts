import {Document, Schema, Model, model, FilterQuery, UpdateQuery} from "mongoose";
import {BaseRepository} from "@models/baseRepository";
import {v4} from "uuid";
import {IUser} from "@models/user/userModel";

export interface IBan extends Document {
    id: string;
    reason: string;
    subject: Schema.Types.ObjectId | IUser;
    issuer: Schema.Types.ObjectId | IUser;
    expiry: Date;
}

export interface IBanRepository extends BaseRepository<IBan> {
    getBans: (pageNumber: number) => Promise<IBan[]>;
    deleteExpiredBans: () => Promise<void>;
    numDocuments: () => Promise<number>;
}

export type IBanModel = IBanRepository & Model<IBan>;

/**
 * The ban schema.
 */
const banSchema = new Schema<IBan, IBanModel>({
    id: { type: String, required: true, unique: true },
    reason: { type: String, required: true, trim: true },
    subject: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    issuer: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    expiry: { type: Schema.Types.Date, required: true }
});

const PAGE_SIZE = 10;

/**
 * Finds a list of bans.
 * @param pageNumber The page number (10 bans per page).
 * @returns Promise that resolves with the list of bans.
 */
banSchema.statics.getBans = async function(pageNumber: number): Promise<IBan[]> {
    const pageIndex = Math.max(0, pageNumber - 1);

    return await BanModel.find()
        .sort({ created_at: -1 })
        .skip(pageIndex * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate("subject")
        .populate("issuer")
        .exec();
}

/**
 * Gets a ban.
 * @param filterQuery The filter query.
 * @returns Promise that resovles with the ban.
 */
banSchema.statics.getOne = async function (filterQuery: FilterQuery<IBan>) {
    return BanModel.findOne(filterQuery);
}

/**
 * Creates a ban.
 * @param data The ban data.
 * @returns Promise that resolves with the created ban.
 */
banSchema.statics.createOne = async function (data: Partial<IBan>): Promise<IBan> {
    let banModel = new BanModel({ id: v4(), ...data });
    await banModel.save();
    return banModel;
}

/**
 * Deletes all expired bans.
 * @returns Promise that resolves with the deleted bans.
 */
banSchema.statics.deleteExpiredBans = function () {
    return BanModel.deleteMany({
        expiry: { $lte: new Date() as any }
    }).exec();
}

/**
 * Counts the number of bans.
 * @returns Promise that resolves with the number of bans.
 */
banSchema.statics.numDocuments = () => BanModel.countDocuments();

/**
 * Checks if a ban exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with whether a suitable ban exists.
 */
banSchema.statics.docExists = (filterQuery: FilterQuery<IBan>) => BanModel.exists(filterQuery);

/**
 * Gets a ban.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the ban.
 */
banSchema.statics.getOne = (filterQuery: FilterQuery<IBan>) => BanModel.findOne(filterQuery);

/**
 * Gets a list of bans.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of bans.
 */
banSchema.statics.get = (filterQuery: FilterQuery<IBan>) => BanModel.find(filterQuery);

/**
 * Modifies a ban.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified ban.
 */
banSchema.statics.modifyOne = (filterQuery: FilterQuery<IBan>, updateQuery: UpdateQuery<IBan>) => BanModel.updateOne(filterQuery, updateQuery);

/**
 * Removes a ban.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed ban.
 */
banSchema.statics.removeOne = (filterQuery: FilterQuery<IBan>) => BanModel.deleteOne(filterQuery);

export const BanModel = model<IBan, IBanModel>('Ban', banSchema);