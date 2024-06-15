import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/emailVerification";

const userRepo = new UserRepository();

export const registerUser = async ( userData: IUser): Promise<any> => {
    
    const existingUser = await userRepo.findByEmail(userData.email);
    if (existingUser) {
        return { success: false, message: "Email already exists" };
    } else {
        console.log("no user found");
        const otp = generateOtp();
        console.log("this is generated otppp",otp);
        
        await sendOtpEmail(userData.email, otp); 
        return {message:"Success", success: true, otp, user_data: userData };
    }
};

export const verifyOtp = async (userData: IUser): Promise<any> => {
    try {
        const savedUser = await userRepo.save(userData);
        console.log("ready to send success message", savedUser);
        return {
            message: "User data saved successfully",
            success: true,
            user_data: savedUser
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error saving user: ${err.message}`);
    }
};

export const resendOtp = async(email: string): Promise<any> =>{
    try {
        console.log("Redend otp", email);
        const otp = generateOtp()
        await sendOtpEmail(email, otp)
        return {succes: true, newOtp:otp}
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error saving user: ${err.message}`);
    }
}


export const loginUser = async(email: string, password: string): Promise<any> =>{
    try {
        const userExist = await userRepo.checkUser(email,password)
        
    } catch (error) {
        
    }
}

