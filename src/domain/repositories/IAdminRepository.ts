import { IAdmin } from "../entities/IAdmin";
import { IUser } from "../entities/IUser";

export interface IAdminRepository {
    findByEmail(email: string, password: string): Promise<{ success: boolean; message: string; admin_data?: IAdmin }>;
    getUsers(): Promise<IUser[]>;
}
