import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOffice extends Document {
    name: string;
    code: string;
    admin: Types.ObjectId; 
    users: Types.ObjectId[]; 
}

const OfficeSchema = new Schema<IOffice>({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Admin reference
    users: [{ type: Schema.Types.ObjectId, ref: "User" }], // Users array
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const Office = mongoose.model<IOffice>("Office", OfficeSchema);
export default Office;
