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

    async fetchedUserData(data: { page: number, limit: number }) {
        const { page, limit } = data;
        try {
            const result = await this.adminService.fetchUsers(page, limit);
            return result;
        } catch (error) {
            console.log("error fetching all users", error);
        }
    }

    async blockUser(data: { userId: string }) {
        try {
            const result = await this.adminService.blockedUser(data.userId);
            return result;
        } catch (error) {
            console.error("Error blocking user:", error);
            return { success: false, message: 'Error blocking user' };
        }
    }

    async searchUserList(data: { searchValue: string }) {
       try {
        const { searchValue } = data;
        const result = await this.adminService.searchUser(searchValue)
        return result;
       } catch (error) {
        console.error("Error blocking user:", error);
        throw new Error("Error occured")
    }
    }

    async fetchUsersReport(){
        try {
            const result = await this.adminService.fetchUsersForReports();
            return result;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw new Error("Error occured")
        }
    }

    async getBlockedUser(){
        try {
            const result = await this.adminService.fetchBlockedUsers();
            return result;
        } catch (error) {
            console.error("Error fetching blocked user:", error);
            throw new Error("Error occured")
        }
    }
}

export const adminController = new AdminController();
