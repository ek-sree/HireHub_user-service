import express from 'express';
import config from '../config';
import { connectToDatabase } from '../database/mongodb';
import { startGrpcServer } from '../grpc/client/grpcServer';
import RabbitMQClient from '../mq/client';

const app = express();
app.use(express.json());


const startServer = async () => {
    try {
        await connectToDatabase();
        startGrpcServer();
        RabbitMQClient.initialize(); 

        const port = config.port;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server', error);
        process.exit(1);
    }
};

startServer();
