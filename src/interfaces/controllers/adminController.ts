import { AdminService } from "../../application/use-case/admin";
import grpcErrorHandler from "../middleware/grpcErrorHandler";

class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async loginAdmin(call:any, callback:any) {
        try {
            const { email, password } = call.request;
            const result = await this.adminService.loginAdmin(email,password);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error);
        }
    }

    async fetchedUserData() {
        try {
            const result = await this.adminService.fetchUsers();
            return result;
        } catch (error) {
            console.log("error fetching all users", error);  
        }
    }

    async blockUser(data: { userId: string }) {
        try {
            console.log("data for block", data);
            const result = await this.adminService.blockedUser(data.userId);
            console.log("block user from controller.....1", result);

            return result;
        } catch (error) {
            console.error("Error blocking user:", error);
            return { success: false, message: 'Error blocking user' };
        }
    }
}

export const adminController = new AdminController();