import { IAdmin } from "../../domain/entities/IAdmin";
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

    async fetchUsers(): Promise<any> {
        try {
            let users = await this.adminRepo.getUsers();

            if (!users) {
                return { success: false, message: "no data found" };
            }
            const user_data = users.map((user: any) => {
                return {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    status: user.status
                };
            });
            return { success: true, user_data };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error finding user details: ${error.message}`);
            }
            throw error;
        }
    }

    async blockedUser(userId: string): Promise<{success: boolean, message: string}> {
        try {
            console.log("sent id for block", userId);
            
            const result = await this.adminRepo.blockUnblock(userId);
            console.log("block message.......", result);
            
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error blocking user: ${error.message}`);
            }
            throw error;
        }
    }
}

export { AdminService }