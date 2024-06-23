import { UserService } from '../../application/use-case/user';
import grpcErrorHandler from '../middleware/grpcErrorHandler';

class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async registerUser(call: any, callback: any) {
        try {
            const result = await this.userService.registerUser(call.request);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async verifyOtp(call: any, callback: any) {
        try {
            const result = await this.userService.verifyOtp(call.request.user_data);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async resendOtp(call: any, callback: any) {
        try {
            const result = await this.userService.resendOtp(call.request.email);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async loginUser(call: any, callback: any) {
        try {
            const { email, password } = call.request;
            const result = await this.userService.loginUser(email, password);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async loginWithGoogle(call: any, callback: any) {
        try {
            const credential = call.request;
            const response = await this.userService.loginWithGoogle(credential);
            callback(null, response);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async fetchedUserData(call: any, callback: any) {
        try {
            const result = await this.userService.fetchUsers();
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }
}

export const userController = new UserController();
