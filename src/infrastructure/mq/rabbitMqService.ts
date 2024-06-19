// import { IUser } from "../../domain/entities/IUser";
// import { getChannel } from "./rabbitMQconfig"


// export const publishUsersToQueue = async (users: IUser[]) => {
//     const channel = getChannel();
//     if(!channel){
//         throw new Error('RabbitMQ channel is not initialized');
//     }

//     try {
//         const usersData = JSON.stringify(users);
//         await channel.assertQueue('user_data_queue');
//         channel.sendToQueue('user_data_queue', Buffer.from(usersData));
//         console.log('User data sent to RabbitMQ');
//     } catch (error) {
//         console.error('Error sending user data to RabbitMQ', error);
//         throw error; 
//     }
// }