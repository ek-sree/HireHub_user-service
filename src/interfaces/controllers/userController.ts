import * as grpc from '@grpc/grpc-js';
import { UserService } from '../../application/use-case/user'

const userService = new UserService();

export const userController = {
    registerUser: async (call: any, callback: any) => {
        try {
            const result = await userService.registerUser(call.request);
            callback(null, result);
        } catch (error) {
            if (error instanceof Error) {
                callback({ code: grpc.status.INTERNAL, message: error.message }, null);
            } else {
                callback({ code: grpc.status.INTERNAL, message: 'Unknown error occurred' }, null);
            }
        }
    },
    verifyOtp: async (call: any, callback: any) => {
        try {
            console.log("guess data from verifyOtp", call.request);
            const result = await userService.verifyOtp(call.request.user_data);
            console.log("otp resss", result);
            callback(null, result);
        } catch (error) {
            if (error instanceof Error) {
                callback({ code: grpc.status.INTERNAL, message: error.message }, null);
            } else {
                callback({ code: grpc.status.INTERNAL, message: 'Unknown error occurred' }, null);
            }
        }
    },
    resendOtp: async (call: any, callback: any) => {
        try {
            const result = await userService.resendOtp(call.request.email);
            console.log("safdfa", result);
            callback(null, result);
        } catch (error) {
            if (error instanceof Error) {
                callback({ code: grpc.status.INTERNAL, message: error.message }, null);
            } else {
                callback({ code: grpc.status.INTERNAL, message: 'Unknown error occurred' }, null);
            }
        }
    },
    loginUser: async (call: any, callback: any) => {
        try {
            const { email, password } = call.request;
            const result = await userService.loginUser(email, password);
            console.log("Login check from controller", result);
            callback(null, result);
        } catch (error) {
            if (error instanceof Error) {
                callback({ code: grpc.status.INTERNAL, message: error.message }, null);
            } else {
                callback({ code: grpc.status.INTERNAL, message: 'Unknown error occurred' }, null);
            }
        }
    },
    loginWithGoogle: async (call: any, callback: any) => {
        try {
            const credential = call.request;
            const response = await userService.loginWithGoogle(credential);
            console.log("res from google logged", response);
            callback(null, response);
        } catch (error) {
            if (error instanceof Error) {
                callback({ code: grpc.status.INTERNAL, message: error.message }, null);
            } else {
                callback({ code: grpc.status.INTERNAL, message: 'Unknown error occurred' }, null);
            }
        }
    },
    fetchedUserData: async (call: any, callback: any) => {
        try {
            console.log("gettinggg get user");
            const result = await userService.fetchUsers();
            console.log("res", result);
            callback(null, result);
        } catch (error) {
            if (error instanceof Error) {
                callback({ code: grpc.status.INTERNAL, message: error.message }, null);
            } else {
                callback({ code: grpc.status.INTERNAL, message: 'Unknown error occurred' }, null);
            }
        }
    }
};
