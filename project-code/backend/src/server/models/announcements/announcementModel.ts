import {IUser, UserDoesNotExistError, UserModel} from "@models/user/userModel";
import {FilterQuery, model, Model, Schema, UpdateQuery} from "mongoose";
import {BaseRepository} from "@models/baseRepository";
import {v4} from "uuid";
import ApiAnnouncement from "@validation/body/apiAnnouncement";
import moment from "moment";

export interface IAnnouncement extends Document {
    id: string;
    content: string;
    title: string;
    author: (Schema.Types.ObjectId | IUser);
}

export interface IAnnouncementRepository extends BaseRepository<IAnnouncement> {
    createAnnouncement: (announcement: ApiAnnouncement, authorId: string) => Promise<IAnnouncement>;
    getOneAndPopulate: (obj: FilterQuery<IAnnouncement>) => Promise<IAnnouncement>;
    getAnnouncements: (obj: FilterQuery<IAnnouncement>) => Promise<IAnnouncement[]>;
}

export type IAnnouncementModel = IAnnouncementRepository & Model<IAnnouncement>;

/**
 * The announcement schema.
 */
const announcementSchema = new Schema<IAnnouncement, IAnnouncementModel>({
    id: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at' } });

/**
 * Updates an announcement.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified announcement.
 */
announcementSchema.statics.modifyOne = (filterQuery: FilterQuery<IAnnouncement>, updateQuery: UpdateQuery<IAnnouncement>) =>
    AnnouncementModel.modifyOne(filterQuery, updateQuery);

/**
 * Removes an announcement.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed announcement.
 */
announcementSchema.statics.removeOne = (filterQuery: FilterQuery<IAnnouncement>) => AnnouncementModel.deleteOne(filterQuery);

/**
 * Creates a new announcement.
 * @param data The announcement data.
 * @returns Promise that resolves with the created announcement.
 */
announcementSchema.statics.createOne = async (data: Partial<IAnnouncement>) => {
    const announcement = new AnnouncementModel({ ...data, id: v4()});
    await announcement.save();
    return announcement;
};

/**
 * Gets and populates the fields of an announcement.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the populated announcement.
 */
announcementSchema.statics.getOneAndPopulate = (filterQuery: FilterQuery<IAnnouncement>) => AnnouncementModel.findOne(filterQuery)
    .populate('author');

/**
 * Creates an announcement from an API announcement.
 * @param apiAnnouncement The API announcement.
 * @param authorId The ID of the author.s
 * @returns Promise that resolves with the created announcement.
 */
announcementSchema.statics.createAnnouncement = async (apiAnnouncement: ApiAnnouncement, authorId: string) => {
    const author = await UserModel.findOne({ id: authorId });

    if (!author)
        throw new UserDoesNotExistError("the given author does not exist");

    return await AnnouncementModel.createOne({
        author: author._id,
        title: apiAnnouncement.title,
        content: apiAnnouncement.content
    });
};

/**
 * Gets an announcement.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the announcement.
 */
announcementSchema.statics.getOne = (filterQuery: FilterQuery<IAnnouncement>) => AnnouncementModel.findOne(filterQuery);

/**
 * Gets a list of announcement.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of announcement.
 */
announcementSchema.statics.get = (filterQuery: FilterQuery<IAnnouncement>) => AnnouncementModel.get(filterQuery);

/**
 * Checks if an announcement exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with whether a matching announcement exists.
 */
announcementSchema.statics.docExists = (filterQuery: FilterQuery<IAnnouncement>) => AnnouncementModel.exists(filterQuery);

/**
 * Gets a list of announcements in the last week.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of announcements.
 */
announcementSchema.statics.getAnnouncements = (filterQuery: FilterQuery<IAnnouncement>) => AnnouncementModel.find({
    ...filterQuery,
    timestamp: {
        $gte: moment().day(-7)
    }
});

export const AnnouncementModel = model<IAnnouncement, IAnnouncementModel>('Announcement', announcementSchema);