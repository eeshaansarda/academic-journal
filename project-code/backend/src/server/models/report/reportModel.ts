import {Document, Schema, Model, model, FilterQuery, UpdateQuery} from "mongoose";
import {ReportStatus} from "@validation/body/apiReport";
import {BaseRepository} from "@models/baseRepository";
import {v4} from "uuid";
import {IUser} from "@models/user/userModel";

export interface IReport extends Document {
    id: string;
    reason: string;
    status: string;
    subject: Schema.Types.ObjectId | IUser;
    reporter: Schema.Types.ObjectId | IUser;
}

export type IReportModel = IReportRepository & Model<IReport>;

export interface IReportRepository extends BaseRepository<IReport>{
    getActiveReports: (pageNumber: number) => Promise<IReport[]>;
    countActiveReports: () => Promise<number>;
    setResolved: (reportId: string) => Promise<boolean>;
    getAndPopulate: (reportId: string) => Promise<IReport>;
}

/**
 * The report schema.
 */
const reportSchema = new Schema<IReport, IReportModel>({
    id: { type: String, required: true, unique: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, required: true },
    subject: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    reporter: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
});

const PAGE_SIZE = 10;

/**
 * Finds a list of reports.
 * @param pageNumber The page number (10 reports per page).
 * @returns Promise that resolves with the list of reports.
 */
reportSchema.statics.getActiveReports = async function(pageNumber: number): Promise<IReport[]> {
    const pageIndex = Math.max(0, pageNumber - 1);

    return await ReportModel.find({ status: 'active' })
        .populate('subject')
        .populate('reporter')
        .sort({ created_at: -1 })
        .skip(pageIndex * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec();
}

/**
 * Counts the number of reports that haven't had any action taken on them
 * yet.
 * @returns Promise that resolves with the number of active reports.
 */
reportSchema.statics.countActiveReports = async function(): Promise<number> {
    return ReportModel.find({status: ReportStatus.ACTIVE})
        .count();
}

/**
 * Modifies a report.
 * @param filterQuery The filter query.
 * @param updateQuery The update query.
 * @returns Promise that resolves with the modified report.
 */
reportSchema.statics.modifyOne = (filterQuery: FilterQuery<IReport>, updateQuery: UpdateQuery<IReport>) => ReportModel.updateOne(filterQuery, updateQuery);

/**
 * Removes a report.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the removed report.
 */
reportSchema.statics.removeOne = (filterQuery: FilterQuery<IReport>) => ReportModel.deleteOne(filterQuery);

/**
 * Creates a new report.
 * @param data The report data.
 * @returns Promise that resolves with the created report.
 */
reportSchema.statics.createOne = async (data: Partial<IReport>) => {
    const report = new ReportModel({ id: v4(), ...data });
    await report.save();
    return report;
};

/**
 * Gets a report.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the report.
 */
reportSchema.statics.getOne = (filterQuery: FilterQuery<IReport>) => ReportModel.findOne(filterQuery);

/**
 * Gets a list of reports.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with the list of reports.
 */
reportSchema.statics.get = (filterQuery: FilterQuery<IReport>) => ReportModel.get(filterQuery);

/**
 * Checks if a report exists.
 * @param filterQuery The filter query.
 * @returns Promise that resolves with whether a suitable report exists.
 */
reportSchema.statics.docExists = (filterQuery: FilterQuery<IReport>) => !!ReportModel.findOne(filterQuery);

/**
 * Marks a report as resolved.
 * @param id The ID of the report.
 * @returns Promise that resolves with whether the report was found and 
 * marked as resolved successfully.
 */
reportSchema.statics.setResolved = async function (id: string) {
    const report = await ReportModel.findOne({ id });

    if (!report) {
        return false;
    }

    report.status = ReportStatus.RESOLVED;
    await report.save();
    return true;
};

/**
 * Gets and populates a report.
 * @param id The ID of the report.
 * @returns Promise that resolves with the populated report.
 */
reportSchema.statics.getAndPopulate = async function (id: string) {
    return ReportModel.findOne({ id })
        .populate('subject')
        .populate('reporter');
}

export const ReportModel = model<IReport, IReportModel>('Report', reportSchema);