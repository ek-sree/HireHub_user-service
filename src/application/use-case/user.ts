import { IUser } from "../../domain/entities/IUser";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { generateOtp } from "../../utils/generateOtp";
import { sendOtpEmail } from "../../utils/emailVerification";
import { OAuth2Client } from 'google-auth-library';
import config from "../../infrastructure/config";

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

    
}

export { UserService };
