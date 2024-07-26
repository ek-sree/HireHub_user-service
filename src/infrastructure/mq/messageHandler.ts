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
                
            case 'add-user-skills':
                response = await userController.addedUserSkills(data);
                break;  
                
            case 'fetch-skills':
                response = await userController.fetchedSkills(data);
                break;    

            case 'user-skills-edit':
                response = await userController.editedSkills(data);
                break;    

            case 'cv-upload':
                response = await userController.addedCv(data);
                break;
                
            case 'fetch-cvs':
                response = await userController.getCvs(data);
                break; 
                
            case 'remove-cv':
                response = await userController.deleteCv(data);
                break;
                
            case 'profile-add':
                response = await userController.addProfile(data);
                break;  
                
            case 'fetch-profile-image':
                response = await userController.fetchedProfile(data);
                break;    

            case 'add-cover-img':
                response = await userController.addCoverPic(data);
                break;  
                
            case 'get-cover-image':
                response = await userController.fetchCoverImg(data);
                break;    

            case 'get-user-details-for-post':
                response = await userController.fetchDataForPost(data);
                break;  

            case 'follow':
                response = await userController.addFollowers(data);
                break; 
                
            case 'unfollow':
                response = await userController.unfollow(data);
                break; 
                
            case 'search-users'  :
                response = await userController.searchUsers(data);
                break;  

            case 'user-log-out':
                response = await userController.logout(data);
                break;    

            default:
                response = { error: 'Operation not supported' };
                break;
        }

        await RabbitMQClient.produce(response, correlationId, replyTo);
    }
}
