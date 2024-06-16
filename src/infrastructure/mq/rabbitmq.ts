import amqp from 'amqplib';

let connection: amqp.Connection;
let channel: amqp.Channel;

export const connectToRabbitMQ = async () => {
    try {
        connection = await amqp.connect('amqp://guest:guest@localhost:5672');
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ', error);
        process.exit(1); 
    }
};

export const getChannel = () => channel;
