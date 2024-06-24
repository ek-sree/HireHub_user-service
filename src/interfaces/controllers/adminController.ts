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

    async blockUser(data: string) {
        try {
            console.log("data for block", data);
            const result = await this.adminService.blockedUser(data)
            return result;
        } catch (error) {
            
        }
    }
}

export const adminController = new AdminController();