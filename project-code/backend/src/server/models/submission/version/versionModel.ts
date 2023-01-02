import {Schema} from "mongoose";

export interface IVersion extends Document {
    version: string;
    directory: string;
    fileName: string;
}

/**
 * The version schema. Each version should be unique within the collection.
 */
export const versionSchema = new Schema<IVersion, {}>({
    version: { type: String, required: true, trim: true },
    directory: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true }
});