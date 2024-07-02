// IAdminRepository.ts

import { IAdmin } from "../entities/IAdmin";
import { IUser } from "../entities/IUser";

export interface IAdminRepository {
    findByEmail(email: string, password: string): Promise<{ success: boolean; message: string; admin_data?: IAdmin }>;
    getUsers(page: number, limit: number): Promise<{ users: IUser[], totalUsers: number }>;
    searchByName(searchValue: string ): Promise<IUser[]>;
}
