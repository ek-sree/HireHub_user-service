import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/HireHub-User-service',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    grpcPort: process.env.GRPC_PORT || 50051,
    EMAIL: process.env.EMAIL_NODEMAILER,
    EMAIL_PASSWORD: process.env.PASSWORD_NODEMAILER
};

export default config;
