import { Channel } from 'amqplib';

export default class Producer {
    constructor(private channel: Channel) {}

    async produceMessage(data: any, correlationId: string, replyToQueue: string) {
        console.log("rabbitmq producer is now on working...", data);
        
        this.channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
            correlationId: correlationId,
        });
    }
}
