// messageHandler.ts
import RabbitMQClient from './client';
import { adminController } from '../../interfaces/controllers/adminController';

export default class MessageHandler {
    static async handle(operation: string, data: any, correlationId: string, replyTo: string) {
        let response;

        switch (operation) {
            case 'get-all-users':
                response = await adminController.fetchedUserData(data);
                console.log("response of fetch user in message handler",response);
                break;

            case 'block-user':
                response = await adminController .blockUser(data)   
                break;
                
            default:
                response = { error: 'Operation not supported' };
                break;
        }

        await RabbitMQClient.produce(response, correlationId, replyTo);
    }
}
