import mongoose from 'mongoose';
import { Admin } from "../../model/Admin";
import { User } from "../../model/User";
import { IAdmin } from "../entities/IAdmin";
import { IUser } from "../entities/IUser";
import { IAdminRepository } from "./IAdminRepository";
import bcrypt from 'bcrypt';

export class AdminRepostory implements IAdminRepository {
    async findByEmail(email: string, password: string): Promise<{ success: boolean; message: string; admin_data?: IAdmin | undefined; }> {
        try {
            const admin_data = await Admin.findOne({ email }).exec();
            if (!admin_data) {
                return { success: false, message: "Email incorrect" };
            }
            const isPasswordMatch = await bcrypt.compare(password, admin_data.password);
            if (!isPasswordMatch) {
                return { success: false, message: "Password incorrect" };
            }
            return { success: true, message: "Admin account found", admin_data };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding admin email and password ${err.message}`);
        }
    }

    async getUsers(page: number, limit: number): Promise<{ users: IUser[], totalUsers: number }> {
        try {
            const skip = (page - 1) * limit;
            const users = await User.find().skip(skip).limit(limit).select('-password').exec();
            const totalUsers = await User.countDocuments();
            return { users, totalUsers };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error fetching users: ${err.message}`);
        }
    }

    async blockUnblock(userId: string | { userId: string }): Promise<{ success: boolean; message: string }> {
        try {
            console.log("Reached for block:", userId);
            const idString = typeof userId === 'string' ? userId : userId.userId;
            if (!mongoose.Types.ObjectId.isValid(idString)) {
                return { success: false, message: 'Invalid userId format' };
            }
            const id = new mongoose.Types.ObjectId(idString);
            console.log("Converted ObjectId:", id);

            const user = await User.findOne({ _id: id });
            console.log("User found for block/unblock:", user);

            if (!user) {
                return { success: false, message: "User not found" };
            }

            user.status = !user.status;
            await user.save();
            console.log("User status updated:", user.status);

            return {
                success: true,
                message: `${user.name} is now ${user.status ? "blocked" : "unblocked"}`
            };
        } catch (error) {
            console.error("Error in blockUnblock:", error);
            const err = error as Error;
            throw new Error(`Error blocking or unblocking user: ${err.message}`);
        }
    }

    async searchByName(searchValue: string): Promise<IUser[]> {
        try {
    
            if (typeof searchValue !== 'string') {
                throw new Error("Invalid search value");
            }
    
            const value = new RegExp(searchValue, "i");
            console.log("Constructed RegExp:", value);
    
            const users = await User.find({ name: value }).select("-password").exec();
    
            return users;
        } catch (error) {
            console.error("Error searching user:", error);
            const err = error as Error;
            throw new Error(`Error searching user list: ${err.message}`);
        }
    }

    async findUsersReports():Promise<{success: boolean, message:string, totalUsers:number}>{
        try {
            let totalUsers;
            const users = await User.find({}).select('-password');
            if(!users){
                return{success:true, message:"Zeor users found", totalUsers:0}
            }
            totalUsers = await User.countDocuments();
            return {success:true, message:"User data got", totalUsers}
        } catch (error) {
            console.error("Error finding user:", error);
            const err = error as Error;
            throw new Error(`Error findding user list: ${err.message}`);
        }
    }

    async findBLockedUsers():Promise<{success:boolean, message:string, data?:number}>{
        try {
            const users = await User.find({status:true}).countDocuments();
            return {success:true, message:"Data found",data:users}
        } catch (error) {
            console.error("Error finding blocked user:", error);
            const err = error as Error;
            throw new Error(`Error findding blocked user list: ${err.message}`);
        }
    }
}
