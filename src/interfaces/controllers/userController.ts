import { registerUser, verifyOtp } from "../../application/use-case/user";
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
    }
}
