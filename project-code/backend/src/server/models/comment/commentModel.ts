import {Model, model, Schema, Document} from "mongoose";
import {IUser} from "@models/user/userModel";

export interface IComment extends Document {
    commentId: number;
    commenter: Schema.Types.ObjectId | IUser;
    pathToFile?: string;
    payload: string;
    parentId?: number;
    anchor: { start: number; end: number; }
    postedAt: Date;
}

export type ICommentModel = Model<IComment>;

/**
 * The comment schema.
 */
const commentSchema = new Schema<IComment, ICommentModel>({
    commenter: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    payload: { type: String, required: true, trim: true },
    pathToFile: { type: String, trim: true },
    commentId: { type: Number, required: true },
    parentId: { type: Number, ref: 'Comment' },
    anchor: {
        start: Number,
        end: Number
    },
    postedAt: Date
}, { timestamps: { createdAt: 'created_at' } });

export const CommentModel = model<IComment, ICommentModel>('Comment', commentSchema);