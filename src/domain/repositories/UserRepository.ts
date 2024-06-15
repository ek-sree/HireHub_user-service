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
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const userWithHashedPassword = { ...user, password: hashedPassword };
            const newUser = new User(userWithHashedPassword);
            await newUser.save();
            return newUser;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error saving user: ${err.message}`);
        }
    }

    async checkUser(email: string, password: string): Promise<{ success: boolean, user?: IUser }> {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return { success: false };
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return { success: false };
            }
            return { success: true, user };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding user by email and password: ${err.message}`);
        }
    }
}
