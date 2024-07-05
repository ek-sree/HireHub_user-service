import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../domain/entities/IUser";

//@ts-ignore
export interface IUserDocument extends IUser, Document {}

const userSchema: Schema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: Number,
        
    },
    password:{
        type: String,
        required: true
    },
    isAdmin:{
        type:Boolean,
        default: false
    },
    coverphoto:{
        type:String,
        
    },
    education:{
        type:[String],
        default:[]
    },
    place:{
        type: [String],
    },
    skills:{
        type:[String],
        default:[]
    },
    status:{
        type:Boolean,
        default:false
    },
    resume:{
        type:[String],
        default:[]
    },
    avatar: {
        type: String
    },
    profileTitle: {
        type: String
    },
    created_at:{
        type:Date,
        required:true,
        default:Date.now
    }
})

export const User = mongoose.model<IUserDocument>('User', userSchema);