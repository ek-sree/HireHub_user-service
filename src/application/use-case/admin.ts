import { IAdmin } from "../../domain/entities/IAdmin";
import { IUser } from "../../domain/entities/IUser";
import { AdminRepostory } from "../../domain/repositories/AdminRepository";

class AdminService {
    private adminRepo: AdminRepostory;

    constructor() {
        this.adminRepo = new AdminRepostory();
    }

    async loginAdmin(email: string, password: string): Promise<{ success: boolean, message: string, admin_data?: IAdmin | undefined }> {
        try {
            const result = await this.adminRepo.findByEmail(email, password);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error logging in: ${error.message}`);
            }
            throw error;
        }
    }

async fetchUsers(page: number, limit: number): Promise<any> {
    try {
        const { users, totalUsers } = await this.adminRepo.getUsers(page, limit);

        if (!users) {
            return { success: false, message: "no data found" };
        }

        const user_data = users.map((user: any) => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.status
        }));

        return { success: true, user_data, totalUsers };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error finding user details: ${error.message}`);
        }
        throw error;
    }
}


    async blockedUser(userId: string): Promise<{success: boolean, message: string}> {
        try {            
            const result = await this.adminRepo.blockUnblock(userId);            
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error blocking user: ${error.message}`);
            }
            throw error;
        }
    }

    async searchUser(searchValue: string): Promise<{ success: boolean, message: string, users?: IUser[] | undefined }> {
        try {
            const users = await this.adminRepo.searchByName(searchValue);
            if (!users || users.length === 0) {
                return { success: false, message: "No user found" };
            }
            return { success: true, message: "User found", users: users };
        } catch (error) {
            console.log("Error occurred while searching user list", error);
            if (error instanceof Error) {
                throw new Error(`Error while searching user list: ${error.message}`);
            }
            throw error;
        }
    }

    async fetchUsersForReports():Promise<{success:boolean, message:string, data?:number}>{
        try {
            const result = await this.adminRepo.findUsersReports();
            return{success:true, message:"user data got", data:result.totalUsers}
        } catch (error) {
            console.log("Error occurred while fetching user list", error);
            if (error instanceof Error) {
                throw new Error(`Error while fetching user list: ${error.message}`);
            }
            throw error;
        }
    }

    async fetchBlockedUsers():Promise<{success:boolean, message:string, data?:number}>{
        try {
            const result = await this.adminRepo.findBLockedUsers();
            return {success:result.success, message:result.message, data:result.data}
        } catch (error) {
            console.log("Error occurred while fetching blocked user list", error);
            if (error instanceof Error) {
                throw new Error(`Error while fetching blocked user list: ${error.message}`);
            }
            throw error;
        }
    }
}

export { AdminService }