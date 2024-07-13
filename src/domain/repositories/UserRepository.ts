import { IUserRepository } from './IUserRepository';
import { IUser } from '../entities/IUser';
import { User } from '../../model/User';
import bcrypt from 'bcrypt';
import { IUserDetails, IUserInfo } from '../entities/IUserDetails';

export class UserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email }).exec();
            return user;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding user by email: ${err.message}`);
        }
    }

    async save(user: IUser): Promise<IUser> {
        try {
            console.log("sasasasdasd", user);
            
            const hashedPassword = await bcrypt.hash(user.password, 10);
            console.log("hash0", hashedPassword);
            
            const userWithHashedPassword = { ...user, password: hashedPassword };
            const { _id, ...userWithoutId } = userWithHashedPassword;
            const newUser = new User(userWithoutId);
            console.log("user ethiyoo", newUser);
            
            await newUser.save();
            console.log("saved and return", newUser);
            
            return newUser;
        } catch (error) {
            const err = error as Error;
            console.error("Error saving user:", err);
            throw new Error(`Error saving user: ${err.message}`);
        }
    }
    

    async checkUser(email: string, password: string): Promise<{ success: boolean, message: string, user_data?: IUser }> {
        try {
            const user_data = await User.findOne({ email }).exec();
            if (!user_data) {
                return { success: false, message: "Email incorrect" };
            }
    
            const isPasswordMatch = await bcrypt.compare(password, user_data.password);
            if (!isPasswordMatch) {
                return { success: false, message: "Password incorrect" };
            }
    
            if (user_data.status === true) {
                return { success: false, message: "Your account is blocked" };
            }
    
            return { success: true, message: "User found", user_data };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding user by email and password: ${err.message}`);
        }
    }

    async addTitle(email: string, title: string): Promise<{success: boolean, message: string, result?: string} > {
        try {
            console.log("emil for add title",email);
            console.log("title for add title",title);
            const user = await User.findOne({email})
            if(!user){
                return {success: false, message:"no user found"}
            }
            user.profileTitle = title;
            const updateUser = await user.save()
            if(!updateUser){
                return {success: false, message:"can't add title right now!!"}
            }
            return{success:true, message:"Title added succesfullt", result:title}
        } catch (error) {
            console.log("error saving title",error);
            const err = error as Error;
            throw new Error(`Error saving Profile title${err.message}`);
        }
    }
    
    async editDetails (email: string, name: string, title: string): Promise<{success: boolean, message: string, result?: { name: string, profileTitle: string }}> {
        try {
            console.log("db repo",email);
            
            const user = await User.findOne({email});
            if(!user){
                console.log("User doesnt found");
                return {success: false, message:"User not found"};
            }
            console.log("name", name);
            
            user.name = name;
            user.profileTitle = title || '';
            const updatedUser = await user.save();
            return {success: true, message:"details updated", result: { name: updatedUser.name, profileTitle: updatedUser.profileTitle || ''}}
        } catch (error) {
            console.log("error editing details",error);
            const err = error as Error;
            throw new Error(`Error editing user details${err.message}`);
        }
    }

    async findDetails(email: string): Promise<{success:boolean,message:string, result?:IUserDetails}>{
        try {
            const user = await User.findOne({email});
            if(!user){
                return {success: false, message: "user Not found"}
            }
            const name = user.name;
            const title = user.profileTitle;
            const result = {name, title};
            
            return {success: true, message:"Found data", result}
        } catch (error) {
            console.log("error fetching details",error);
            const err = error as Error;
            throw new Error(`Error fetchinguser details${err.message}`);
        }
    }

    async findUserInfo(email:string): Promise<{success: boolean, message:string, result?:IUserInfo}>{
        try {
            const user = await User.findOne({email});
            if(!user){
                return {success: false, message:"User not found"};
            }
            const userInfo: IUserInfo = {
                email: user.email,
                phone: user.phone || '',
                place: user.place || [], 
            education: user.education || []
            } 
            
            
            return {success: true, message:"Found user", result:userInfo}
        } catch (error) {
            console.log("error fetching user infos",error);
            const err = error as Error;
            throw new Error(`Error fetchinguser infos ${err.message}`);
        }
    }

    async editInfo(userInfo: IUserInfo): Promise<{ success: boolean, message: string, data?: IUserInfo }> {
        try {
            console.log("repo userinfo", userInfo);
            const { email, phone, education, place } = userInfo;
            
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            
            if (phone !== undefined) {
                user.phone = phone;
            }
            if (education) {
                user.education = education.length ? education : []; 
            }
            if (place) {
                user.place = place.length ? place : [];  
            }
    
            const updatedUser = await user.save();
            const updatedUserInfo: IUserInfo = {
                email: updatedUser.email,
                phone: updatedUser.phone || '',
                place: updatedUser.place || [],
                education: updatedUser.education || []
            };
    
            return { success: true, message: "User info updated successfully", data: updatedUserInfo };
        } catch (error) {
            console.log("error editing user infos", error);
            const err = error as Error;
            throw new Error(`Error editing user infos ${err.message}`);
        }
    }

    async createSkills(email:string, skills:{skills:{skills:string[]}}): Promise<{success: boolean, message:string, data?:string[]}>{
        try {
            console.log("email repo", email, skills.skills.skills,"-=-=-");
            const user = await User.findOne({email});
            if(!user){
                return { success: false, message:"User not found"}
            }
            
            user.skills = [...skills.skills.skills];
            const updatedUser = await user.save();
            return { success: true, message:"add skills", data:updatedUser.skills}
        } catch (error) {
            console.log("error adding user skills", error);
            const err = error as Error;
            throw new Error(`Error adding user skills ${err.message}`);
        }
        }

    async findSkills(email:string):Promise<{success:boolean, message:string, data?:string[]}>{
        try {
            const user = await User.findOne({email});
            if(!user){
                return {success: false, message:"user not found"};
            }
            const data = user.skills;
            return {success: true, message:"Data found", data}
        } catch (error) {
            console.log("error fetching user skills", error);
            const err = error as Error;
            throw new Error(`Error fetching user skills ${err.message}`);
        }
    }

    async updateSkills(email:string, skills:string[]): Promise<{success: boolean, message:string, data?:string[]}>{
        try {
            const user = await User.findOne({email});
            if(!user){
                return{success:false, message:"User not found"}
            }
            user.skills = skills; 
            const updatedUser = await user.save();
            return {success:true, message:"User updated", data:updatedUser.skills}
        } catch (error) {
            console.log("error editing user skills", error);
            const err = error as Error;
            throw new Error(`Error editing user skills ${err.message}`);
        }
    }

    async uploadCv(email: string, fileUrls: string, realFileName: string): Promise<{ success: boolean, message: string, data?: string }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "user not found" };
            }
            if (!user.cv) {
                user.cv = [];
            }
            user.cv.push({ url: fileUrls, filename: realFileName });
            const updateDetails = await user.save();
            console.log("uploaded successfully", updateDetails);
    
            return { success: true, message: "Updated successfully", data: updateDetails.cv?.[0].url || '' };
        } catch (error) {
            console.log("error adding user cv", error);
            const err = error as Error;
            throw new Error(`Error adding user cv ${err.message}`);
        }
    }
    
    

    async findCv(email: string): Promise<{ success: boolean, message: string, cvUrls?: { url: string, filename: string }[] }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            return { success: true, message: "cv urls found", cvUrls: user.cv };
        } catch (error) {
            console.log("error fetching user cv", error);
            const err = error as Error;
            throw new Error(`Error fetching user cv ${err.message}`);
        }
    }
    
    async removeCv(url:string, email:string): Promise<{success:boolean, message:string}>{
        try {
            console.log("gettinf data in db ??");
            
            const user = await User.findOne({email});
            if(!user) {
                return {success: false, message:"user not found"}
            }
            console.log("..........");
            
            if (!user.cv) {
                return { success: false, message: "No CVs found for the user" };
            }
            const fileName = url.split('/').pop()?.split('?')[0];
        console.log("Extracted file name: ", fileName);

        const cvIndex = user.cv.findIndex(cv => cv.url === fileName);
            if(cvIndex === -1){
                return { success: false, message: "CV not found" };
            }

            user.cv.splice(cvIndex, 1);
             await user.save();
             console.log("success db remove");
             
             return {success:true, message:"delete successfully"}

        } catch (error) {
            console.log("error removing user cv", error);
            const err = error as Error;
            throw new Error(`Error removing user cv ${err.message}`);
        }
    }

    async saveProfile(email: string, image: string, originalname: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
    
            user.avatar = { imageUrl: image, originalname }; 
            
            const savedUser = await user.save();
            return { success: true, message: "Url saved successfully", data: savedUser.avatar };
        } catch (error) {
            console.log("Error saving profile image", error);
            const err = error as Error;
            throw new Error(`Error saving profile image: ${err.message}`);
        }
    }
    
    

    async getProfileImage(email: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
    
            const userAvatar = user.avatar || { imageUrl: '', originalname: '' };
            return { success: true, message: "User profile image found", data: userAvatar };
        } catch (error) {
            console.log("Error fetching profile img", error);
            const err = error as Error;
            throw new Error(`Error fetching profile img ${err.message}`);
        }
    }
    
    
}
