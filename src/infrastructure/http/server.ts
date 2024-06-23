import express from 'express';
import config from '../config';
import { connectToDatabase } from '../database/mongodb';
import { connectToRabbitMQ } from '../mq/rabbitMQconfig';
import { startGrpcServer } from '../grpc/client/grpcServer';


const app = express();
app.use(express.json());


const startServer = async () => {
    try {
        await connectToDatabase();
        await connectToRabbitMQ();
        startGrpcServer();

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
