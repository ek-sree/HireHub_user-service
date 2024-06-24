import { Channel, connect, Connection } from 'amqplib';
import rabbitmqConfig from '../config/rabbitMq';
import Producer from './producer';
import Consumer from './consumer';

class RabbitMQClient {
    private static instance: RabbitMQClient;
    private connection: Connection | undefined;
    private producerChannel: Channel | undefined;
    private consumerChannel: Channel | undefined;
    private producer: Producer | undefined;
    private consumer: Consumer | undefined;
    private isInitialized = false;

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            this.connection = await connect(rabbitmqConfig.rabbitMQ.url);
            [this.producerChannel, this.consumerChannel] = await Promise.all([
                this.connection.createChannel(),
                this.connection.createChannel(),
            ]);

            await this.producerChannel.assertQueue(rabbitmqConfig.rabbitMQ.queues.userQueue, { durable: true });
            await this.consumerChannel.assertQueue(rabbitmqConfig.rabbitMQ.queues.userQueue, { durable: true });

            this.producer = new Producer(this.producerChannel);
            this.consumer = new Consumer(this.consumerChannel);
            await this.consumer.consumeMessages();

            this.isInitialized = true;
        } catch (error) {
            console.error('RabbitMQ error:', error);
        }
    }

    async produce(data: any, correlationId: string, replyToQueue: string) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.producer?.produceMessage(data, correlationId, replyToQueue);
    }
}

export default RabbitMQClient.getInstance();
