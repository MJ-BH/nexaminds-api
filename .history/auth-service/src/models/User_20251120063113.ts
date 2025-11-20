import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    fullname: string;
    email: string;
    password?: string;
    generatedUrl?: string;
}

const userSchema: Schema = new Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    generatedUrl: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);