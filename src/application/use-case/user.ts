import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/emailVerification";
import { OAuth2Client } from 'google-auth-library';
import config from "../../infrastructure/config";
import { IUserDetails, IUserInfo } from "../../domain/entities/IUserDetails";
import sharp from "sharp";
import { uploadFileToS3 } from "../../infrastructure/s3/s3Action";
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
            console.log("Check user responseeeeee", result);
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

    async fetchUserDetails(data:{email: string}): Promise<{success: boolean, message:string, details?:IUserDetails}>{
        try {
            const { email } = data;
        console.log("email", email);
            
            const result = await this.userRepo.findDetails(email)
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

    async fetchUserInfo(data:{email: string}): Promise<{success: boolean, message:string, info?:IUserInfo}>{
        try {
            const {email} = data;
            const result = await this.userRepo.findUserInfo(email);
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

    async fetchSkills(data:{email:string}):Promise<{success:boolean, message:string, skills?:string[]}>{
        try {
            const {email} = data;
            const skills = await this.userRepo.findSkills(email)
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
            const email = data.email;
            const { buffer: bufferObj, originalname } = data.cvFile;
    
            // Convert buffer object to Buffer
            const buffer = Buffer.from(bufferObj.data);
    
            if (!Buffer.isBuffer(buffer)) {
                throw new Error("cvFile buffer is not a valid Buffer");
            }
    
            const uploadFile = await uploadFileToS3(buffer, originalname);
    
            const result = await this.userRepo.uploadCv(email, uploadFile);
    
            if (!result.success) {
                return { success: false, message: "Can't upload image name to database" };
            }
    
            return { success: true, message: "Successfully saved", fileUrl: result.data };
        } catch (error) {
            console.error("Error adding user cv:", error);
            throw new Error("Error occurred while adding user cv");
        }
    }
    
    
    
}

export { UserService };
