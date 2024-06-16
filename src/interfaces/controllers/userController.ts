import { registerUser, verifyOtp, resendOtp, loginUser } from "../../application/use-case/user";
import * as grpc from '@grpc/grpc-js'



export const userController = {
    registerUser: async(call: any, callback:any)=>{
        try {
            const result = await registerUser( call.request);
            callback(null, result);
        } catch (error) {
            const err = error as Error;
            callback({
                code: grpc.status.INTERNAL,
                message:err.message,
            },null);
        }
    },
    verifyOtp: async(call: any, callback:any)=>{
        try {
            console.log("guess data from verifyOtp",call.request);
            const result= await verifyOtp(call.request.user_data);
            console.log("hehehehe", result);
            callback(null, result);
        } catch (error) {
         const err = error as Error;
         callback({
            code:grpc.status.INTERNAL,
            message:err.message,
         },null);   
        }
    },

    ResendOtp: async(call: any, callback: any)=>{
        try {
            const result = await resendOtp(call.request.email)
            console.log("safdfa",result);
            
            callback(null, result)
        } catch (error) {
            const err = error as Error;
         callback({
            code:grpc.status.INTERNAL,
            message:err.message,
         },null); 
        }
    },

    loginUser: async(call:any, callback: any)=>{
        try {
            const { email, password} = call.request
            const result = await loginUser(email, password);
            console.log("Login check from controller", result);       
            callback(null, result);
        } catch (error) {
            const err = error as Error;
            callback({
               code:grpc.status.INTERNAL,
               message:err.message,
            },null); 
           }
    }
    
 }

