import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { userController } from '../../../interfaces/controllers/userController';
import config from '../../config';
import { adminController } from '../../../interfaces/controllers/adminController';

const USER_PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');
const ADMIN_PROTO_PATH = path.resolve(__dirname, '../proto/admin.proto');

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const adminPackageDefinition = protoLoader.loadSync(ADMIN_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProtoDescription = grpc.loadPackageDefinition(userPackageDefinition) as any;
const adminProtoDescription = grpc.loadPackageDefinition(adminPackageDefinition) as any;

const userProto = userProtoDescription.user;
const adminProto = adminProtoDescription.admin;

const server = new grpc.Server();

//userController
server.addService(userProto.UserService.service, {
    RegisterUser: userController.registerUser.bind(userController),
    VerifyOtp: userController.verifyOtp.bind(userController),
    ResendOtp: userController.resendOtp.bind(userController),
    Login: userController.loginUser.bind(userController),
    LoginWithGoogle: userController.loginWithGoogle.bind(userController),
});

//adminController
server.addService(adminProto.AdminService.service, {
    Login: adminController.loginAdmin.bind(adminController)
})

const startGrpcServer = () => {
    const grpcPort = config.grpcPort;
    server.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error("Failed to start grpc server:", err);
            return;
        } else {
            console.log(`gRpc server running at http://0.0.0.0:${bindPort}`);
        }
    });
};

export { startGrpcServer };
