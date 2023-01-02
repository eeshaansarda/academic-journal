import {Schema} from "mongoose";

export interface ISupportingDocument extends Document {
    fileName: string;
    id: string;
}

/**
 * The supporting document schema.
 */
export const supportingDocumentSchema = new Schema<ISupportingDocument, {}>({
    fileName: { type: String, required: true, trim: true },
    id: { type: String, required: true }
});