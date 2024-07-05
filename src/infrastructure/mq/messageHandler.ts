import RabbitMQClient from './client';
import { adminController } from '../../interfaces/controllers/adminController';
import { userController } from '../../interfaces/controllers/userController';

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

            case 'search-user':
                response = await adminController.searchUserList(data);
                break;  
                
            case 'profile-title-add':
                response = await userController.addNewProFileTitle(data);
                break;
                
            case 'edit-details':
                response = await userController.editDetails(data);
                break;    
            
            case 'view-details':
                response = await userController.fetchedDetails(data);
                break;

            case 'user-info':
                response = await userController.fetchedUserInfo(data);
                break; 
                
            case 'user-info-edit':
                response = await userController.editedUserInfo(data);
                break;    

            default:
                response = { error: 'Operation not supported' };
                break;
        }

        await RabbitMQClient.produce(response, correlationId, replyTo);
    }
}
