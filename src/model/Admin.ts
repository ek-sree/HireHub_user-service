import mongoose, { Document, Schema } from "mongoose";
import { IAdmin } from "../domain/entities/IAdmin";

export interface IAdminDocument extends IAdmin, Document {}

const adminSchema: Schema = new Schema({
    name:{
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

export const Admin = mongoose.model<IAdminDocument>('admin', adminSchema);