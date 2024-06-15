import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { userController } from '../../../interfaces/controllers/userController';
import config from '../../config';

const PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase:true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true,
});

const protoDescription = grpc.loadPackageDefinition(packageDefinition) as any;
const userProto = protoDescription.user;

const server = new grpc.Server();
server.addService(userProto.UserService.service,{
    RegisterUser: userController.registerUser,
    VerifyOtp: userController.verifyOtp,
    ResendOtp: userController.ResendOtp,
    Login: userController.loginUser,
});

const startGrpcServer = ()=>{
    const grpcPort = config.grpcPort;
    server.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(),(err, bindPort)=>{
        if(err){
            console.error("Faild to start grpc server:", err);
            return;
        }else{
            console.log(`gRpc server running at http://0.0.0.0:${bindPort}`);
            
        }
    })
}

export { startGrpcServer };