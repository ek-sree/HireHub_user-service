import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/HireHub',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    grpcPort: process.env.GRPC_PORT || 50051
};

export default config;
