import { IUserRepository } from './IUserRepository';
import { IUser } from '../entities/IUser';
import { User } from '../../model/User';
import bcrypt from 'bcrypt';

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
            const newUser = new User(userWithHashedPassword);
            await newUser.save();
            console.log("saved and return", newUser);
            
            return newUser;
        } catch (error) {
            const err = error as Error;
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
    
            if (user_data.status !== true) {
                return { success: false, message: "Your account is blocked" };
            }
    
            return { success: true, message: "User found", user_data };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding user by email and password: ${err.message}`);
        }
    }
    
}
