import { IUser } from "../entities/IUser";

export interface IUserRepository {
    findByEmail(email: string): Promise<IUser | null>;
    save(user: IUser): Promise<IUser>;
    checkUser(email: string, password: string): Promise<{ success: boolean, message: string, user_data?: IUser }>;
}