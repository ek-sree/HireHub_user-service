import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/emailVerification";
import { OAuth2Client } from 'google-auth-library';
import config from "../../infrastructure/config";
import { IUserDetails, IUserInfo, IUserPostDetails } from "../../domain/entities/IUserDetails";
import sharp from "sharp";
import { deleteFileFromS3, fetchFileFromS3, uploadFileToS3 } from "../../infrastructure/s3/s3Action";
import { Buffer } from 'buffer';

class UserService {
    private userRepo: UserRepository;
    private client: OAuth2Client;

    constructor() {
        this.userRepo = new UserRepository();
        this.client = new OAuth2Client(config.CLIENT_ID);
    }

    async registerUser(userData: IUser): Promise<any> {
        try {
            const existingUser = await this.userRepo.findByEmail(userData.email);
            if (existingUser) {
                return { success: false, message: "Email already exists" };
            } else {
                console.log("no user found");
                const otp = generateOtp();
                console.log("this is generated otppp", otp);

                await sendOtpEmail(userData.email, otp);

                return { message: "Success", success: true, otp, user_data: userData };
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error saving user: ${error.message}`);
            }
            throw error;
        }
    }

    async verifyOtp(userData: IUser): Promise<any> {
        try {
            console.log("isecase", userData);

            const savedUser = await this.userRepo.save(userData);
            console.log("ready to send success message", savedUser);
            return {
                message: "User data saved successfully",
                success: true,
                user_data: savedUser
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error saving user: ${error.message}`);
            }
            throw error;
        }
    }

    async resendOtp(email: string): Promise<any> {
        try {
            console.log("Redend otp", email);
            const otp = generateOtp();
            await sendOtpEmail(email, otp);
            return { success: true, newOtp: otp };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error resending OTP: ${error.message}`);
            }
            throw error;
        }
    }

    async loginUser(email: string, password: string): Promise<any> {
        try {
            const result = await this.userRepo.checkUser(email, password);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error logging in: ${error.message}`);
            }
            throw error;
        }
    }

    async loginWithGoogle(credential: any): Promise<any> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: credential.credential,
                audience: config.CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) throw new Error('Invalid Google credentials');
            console.log("payload", payload);

            const email = payload.email;
            const name = payload.name;

            if (!email) throw new Error('Email not available in Google credentials');

            let user = await this.userRepo.findByEmail(email);
            console.log("google auth", user);

            if (!user) {
                user = await this.userRepo.save({
                    email,
                    name,
                    password: 'defaultpassword',
                } as IUser);
            }
            console.log("saved user details", user);

            return { success: true, user_data: user };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error logging in with Google: ${error.message}`);
            }
            throw error;
        }
    }

    async addNewTitle(data: {email: string, title: string}): Promise<{success:boolean, message:string, result?: string}>{
        try {
            const {email, title} = data;
            console.log("service data",email, title);
            
            const result = await this.userRepo.addTitle(email,title);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error adding new title: ${error.message}`);
            }
            throw error;
        }
    }

    async updateDetails(data:{email: string, title: string, name: string}): Promise<{success: boolean, message:string, details?: IUserDetails}>{
        try {
            console.log("data form controller",data);
            
            const {email, name, title} = data;
            const result = await this.userRepo.editDetails(email,name,title);
            console.log(".......",name);
            
            if(!result) {
                return {success: false, message:"cant edit details"};
            }
            const details = {
                name: result.result?.name || '',
                profileTitle: result.result?.profileTitle || ''
            };
            return {success: true, message:"details edited", details};
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error adding new title: ${error.message}`);
            }
            throw error;
        }
    }

    async fetchUserDetails(data:{userId: string, followerId:string}): Promise<{success: boolean, message:string, details?:IUserDetails}>{
        try {
            const { userId, followerId } = data;
        console.log("email alla", userId, followerId);
            
            const result = await this.userRepo.findDetails(userId,followerId)
            if(!result.success){
                return{success: false, message:"cant find details"}
            }
            return {success:true, message:"user found", details:result.result}
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error adding new title: ${error.message}`);
            }
            throw error
        }
    }

    async fetchUserInfo(data:{userId: string}): Promise<{success: boolean, message:string, info?:IUserInfo}>{
        try {
            const {userId} = data;
            const result = await this.userRepo.findUserInfo(userId);
            if(!result.success || !result.result){
                return {success: false, message:"No info found"}
            }
            const info: IUserInfo = {
                email: result.result.email,
                phone: result.result.phone || '',
                place: Array.isArray(result.result.place) ? result.result.place : [result.result.place || ''],
            education: Array.isArray(result.result.education) ? result.result.education : [result.result.education || '']
            };
            return {success: true, message:"User info found", info}
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error adding new title: ${error.message}`);
            }
            throw error 
        }
    }

    async editUserInfo(data: { email: string, phone: string, education: string[], place: string[] }): Promise<{ success: boolean, message: string, data?: IUserInfo }> {
        try {
            const { email, phone, education, place } = data;
            console.log("in service info....", email, phone, education, place);
            
            const result = await this.userRepo.editInfo({ email, phone, education, place });
            const updatedUserInfo: IUserInfo = {
                email: result.data?.email || '',
                phone: result.data?.phone || '',
                place: result.data?.place || [],
                education: result.data?.education || []
            };
    
            return { success: true, message: "User info updated successfully", data: updatedUserInfo };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error editing user info: ${error.message}`);
            }
            throw error;
        }
    }

    async addSkills(data:{email:string, skills:string[]}): Promise<{success: boolean, message:string, result?:string[]}>{
        try {
            console.log("rrrrrrrr",data);
            
            const {email, skills} = data;
            const result = await this.userRepo.createSkills(email,{skills:{skills}});
            if(!result){
                return {success:false, message:"Cant add skills"};
            }
            return {success:true, message:"Skills added", result:result.data}
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error adding new skills: ${error.message}`);
            }
            throw error;
        }
    }

    async fetchSkills(data:{userId:string}):Promise<{success:boolean, message:string, skills?:string[]}>{
        try {
            const {userId} = data;
            const skills = await this.userRepo.findSkills(userId)
            if(!skills){
                return {success:false, message:"Data not found"}
            }
            return {success:true, message:"data found", skills:skills.data}
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching new skills: ${error.message}`);
            }
            throw error;
        }
    }

    async editSkills(email:string, skills:string[]): Promise<{success:boolean, message:string, data?:string[]}>{
        try {
            const result = await this.userRepo.updateSkills(email,skills)
            if(!result){
                return {success:false, message:"Cant update user skills"}
            }
            return {success:true, message:"user skill updated",data:result.data}
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error editing new skills: ${error.message}`);
            }
            throw error;
        }
    }

    async addCV(data: { email: string, cvFile: { buffer: { type: string, data: number[] }, originalname: string } }): Promise<{ success: boolean, message: string, fileUrl?: string }> {
        console.log("Data received:", data);
    
        try {
            const realFileName = data.cvFile.originalname
            const email = data.email;
            const { buffer: bufferObj, originalname } = data.cvFile;
            const buffer = Buffer.from(bufferObj.data);
    
            if (!Buffer.isBuffer(buffer)) {
                throw new Error("cvFile buffer is not a valid Buffer");
            }
    
            const uploadFile = await uploadFileToS3(buffer, originalname);
    
            const result = await this.userRepo.uploadCv(email, uploadFile, realFileName);
    
            if (!result.success) {
                return { success: false, message: "Can't upload image name to database" };
            }
    
            return { success: true, message: "Successfully saved", fileUrl: result.data };
        } catch (error) {
            console.error("Error adding user cv:", error);
            throw new Error("Error occurred while adding user cv");
        }
    }

    async getCvs(email: string): Promise<{ success: boolean, message: string, cv?: { url: string, filename: string }[] }> {
        try {
            const cvUrlsResponse = await this.userRepo.findCv(email);
            if (!cvUrlsResponse.success || !cvUrlsResponse.cvUrls) {
                return { success: false, message: "Couldn't find CV URLs" };
            }
    
            const result = await fetchFileFromS3(cvUrlsResponse.cvUrls);
            if (!result) {
                return { success: false, message: "Can't access images from S3" };
            }
    
            return { success: true, message: "Images fetched", cv: result };
        } catch (error) {
            console.error("Error fetching user CV:", error);
            throw new Error("Error occurred while fetching user CV");
        }
    }

    async deleteCv(url:string, email:string): Promise<{success:boolean, message:string}>{
        try {
            console.log("url,email",url, email);
            
            const result = await this.userRepo.removeCv(url,email);
            if(!result.success){
                return {success:false, message:"Deleting url from db is failed"}
            }
            const response = await deleteFileFromS3(url);
            if(!response.success){
                return {success:false, message:"cant delete file from s3"}
            }
            return {success:true, message:"Deleted file from s3 too"}
        } catch (error) {
            console.error("Error removing user CV:", error);
            throw new Error("Error occurred while removing user CV");
        }
    }

    async addProfile(data: { email: string; image: { buffer: { type: string; data: number[] }; originalname: string } }): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
        try {
            const { email, image: { originalname, buffer } } = data;
            const bufferData = Buffer.from(buffer.data);
            const uploadFile = await uploadFileToS3(bufferData, originalname);
            const result = await this.userRepo.saveProfile(email, uploadFile, originalname);
    
            if (!result) {
                return { success: false, message: "Profile pic not added" };
            }
    
            return { success: true, message: "Profile pic added", data: result.data };
        } catch (error) {
            console.error("Error adding profile pic:", error);
            throw new Error("Error occurred while adding profile pic");
        }
    }
    
    
    async getProfile(userId: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
        try {
            const result = await this.userRepo.getProfileImage(userId);
            if (!result || !result.data || !result.data.imageUrl) {
                return { success: true, message: "No profile picture found", data: { imageUrl: "/default-profile.jpg", originalname: "default-profile.jpg" } };
            }
    
            const files = [{ url: result.data.imageUrl, filename: result.data.originalname }];
    
            const avatar = await fetchFileFromS3(files);
    
            if (avatar.length > 0) {
                return { success: true, message: "Data found", data: { imageUrl: avatar[0].url, originalname: avatar[0].filename } };
            }
    
            return { success: false, message: "No avatar found" };
        } catch (error) {
            console.error("Error fetching profile pic:", error);
            throw new Error("Error occurred while fetching profile pic");
        }
    }
    
    async addCoverImg(data: { email: string; image: { buffer: { type: string; data: number[] }; originalname: string } }):Promise<{success:boolean, message:string, data?: { imageUrl: string; originalname: string }}>{
        try {
            const { email, image: { originalname, buffer } } = data;
            console.log("not buffer data",buffer.data);
            
            const bufferData = Buffer.from(buffer.data);
            console.log("buffered data",bufferData);
            
            const uploadFile = await uploadFileToS3(bufferData, originalname);
            const result = await this.userRepo.saveCoverImg(email,uploadFile,originalname);
            if(!result){
                return {success:false, message:"cant add data"}
            }
            return {success:true, message:result.message, data:result.data}
        } catch (error) {
            console.error("Error adding cover pic:", error);
            throw new Error("Error occurred while adding cover pic");
        }
    }

    async getCoverImg(userId:string):Promise<{success:boolean, message:string, data?:{ imageUrl: string; originalname: string }}>{
        try {
            const result = await this.userRepo.getCoverImage(userId);
            if (!result || !result.data || !result.data.imageUrl) {
                return { success: true, message: "No profile picture found", data: { imageUrl: "/default-profile.jpg", originalname: "default-profile.jpg" } };
            }
            const files = [{ url: result.data.imageUrl, filename: result.data.originalname }];
            const coverImg = await fetchFileFromS3(files);
            
            if (coverImg.length > 0) {
                return { success: true, message: "Data found", data: { imageUrl: coverImg[0].url, originalname: coverImg[0].filename } };
            }
    
            return { success: false, message: "No avatar found" };
        } catch (error) {
            console.error("Error fetching cover  pic:", error);
            throw new Error("Error occurred while fetching cover  pic");
        }
    }

    async fetchUserDatasForPost(userId: string): Promise<{ success: boolean; message: string; data?: IUserPostDetails }> {
        try {
    
            const result = await this.userRepo.findUserDetailsForPost(userId);
            if (!result || !result.data) {
                return { success: false, message: "No data found" };
            }
    
            const { id,name, avatar } = result.data;
            if (avatar) {
                const files = [{ url: avatar.imageUrl, filename: avatar.originalname }];
                const fetchedAvatar = await fetchFileFromS3(files);
    
                if (fetchedAvatar.length > 0) {
                    const avatarData = {
                        imageUrl: fetchedAvatar[0].url,
                        originalname: fetchedAvatar[0].filename,
                    };
    
                    return {
                        success: true,
                        message: "Data found",
                        data: { id, name, avatar: avatarData },
                    };
                }
            }
    
            return { success: false, message: "No avatar found" };
        } catch (error) {
            console.error("Error fetching user data for post:", error);
            throw new Error("Error occurred while fetching user data for post");
        }
    }
    
    async addFollowers(userId: string, followerId: string): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.userRepo.createFollow(userId, followerId);
            if (!result.success) {
                return { success: result.success, message: result.message };
            }
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Error following:", error);
            throw new Error("Error occurred while following");
        }
    }  
    
    async removeFollowers(userId:string, followerId:string):Promise<{success:boolean, message:string}>{
        try {
            const result = await this.userRepo.deleteFollow(userId, followerId);
            if(!result.success){
                return {success:result.success, message:result.message}
            }
            return {success:true, message:result.message}
        } catch (error) {
            console.error("Error unfollowing:", error);
            throw new Error("Error occurred while unfollowing");
        }
    }

    async searchUser(searchQuery: string): Promise<{ success: boolean; message: string; data?: IUserPostDetails[] }> {
        try {
            const result = await this.userRepo.searchUsers(searchQuery);
            if (!result || !result.data) {
                return { success: false, message: "No users found" };
            }
            console.log("result data", result);
    
            const postWithImage = await Promise.all(result.data.map(async (post) => {
                if (post.avatar && post.avatar.imageUrl) {
                    const files = [{ url: post.avatar.imageUrl, filename: post.avatar.originalname }];
                    const imageUrlData = await fetchFileFromS3(files);
                    if (imageUrlData.length > 0) {
                        post.avatar.imageUrl = imageUrlData[0].url;
                    }
                }
                return post;
            }));
    
            return { success: true, message: "User found", data: postWithImage };
        } catch (error) {
            console.error("Error searching users:", error);
            throw new Error("Error occurred while searching users");
        }
    }
    
}

export { UserService };
