// consumer.ts
import { Channel, ConsumeMessage } from 'amqplib';
import MessageHandler from './messageHandler';
import rabbitmqConfig from '../config/rabbitMq';

export default class Consumer {
    constructor(private channel: Channel) {}

    async consumeMessages() {
        console.log('Ready to consume messages');
        await this.channel.assertQueue(rabbitmqConfig.rabbitMQ.queues.userQueue, { durable: true });
        this.channel.consume(rabbitmqConfig.rabbitMQ.queues.userQueue, async (message: ConsumeMessage | null) => {
            if (message) {
                const { correlationId, replyTo } = message.properties;
                const operation = message.properties.headers?.function;

                if (message.content) {
                    const data = JSON.parse(message.content.toString());
                    await MessageHandler.handle(operation, data, correlationId, replyTo);
                }
            }
        }, { noAck: true });
    }
}
