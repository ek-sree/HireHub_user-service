import { IUser } from "../../domain/entities/IUser";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";


const userRepo = new UserRepository();

export const registerUser = async ( userData: IUser): Promise<any> => {
    
    const existingUser = await userRepo.findByEmail(userData.email);
    if (existingUser) {
        return { success: false, message: "Email already exists" };
    } else {
        console.log("no user found");
        const otp = generateOtp();
        console.log("this is generated otppp",otp);
        
        await sendOtpToUser(userData.email, otp); 
        return {message:"Success", success: true, otp, user_data: userData };
    }
};

export const verifyOtp = async (userData: IUser): Promise<any> => {
    try {
        const savedUser = await userRepo.save(userData);
        console.log("ready to send success message", savedUser);
        
        // Return the saved user data along with the success message
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


function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpToUser(email: string, otp: string): Promise<void> {
    console.log(`Sending OTP ${otp} to email ${email}`);
}
