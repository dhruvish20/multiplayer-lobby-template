import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    role: "admin" | "user"; // Ensuring only valid roles
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "user"], // Ensures only "admin" or "user" can be set
        required: true,
    },
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
