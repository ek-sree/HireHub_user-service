import { UserService } from '../../application/use-case/user';
import { IUserPostDetails } from '../../domain/entities/IUserDetails';
import grpcErrorHandler from '../middleware/grpcErrorHandler';

class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async registerUser(call: any, callback: any) {
        try {
            const result = await this.userService.registerUser(call.request);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async verifyOtp(call: any, callback: any) {
        try {
            const result = await this.userService.verifyOtp(call.request.user_data);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async resendOtp(call: any, callback: any) {
        try {
            const result = await this.userService.resendOtp(call.request.email);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async loginUser(call: any, callback: any) {
        try {
            const { email, password } = call.request;
            const result = await this.userService.loginUser(email, password);
            callback(null, result);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async loginWithGoogle(call: any, callback: any) {
        try {
            const credential = call.request;
            const response = await this.userService.loginWithGoogle(credential);
            callback(null, response);
        } catch (error) {
            grpcErrorHandler(callback, error); 
        }
    }

    async addNewProFileTitle(data: {data: {email:string, title: {title: string}}}){
        try {
            const { email, title } = data.data;
            const result = await this.userService.addNewTitle({email, title: title.title});
            return result;
        } catch (error) {
            console.error("Error adding title:", error);
            throw new Error("Error occured")
        }
    }

    async editDetails(data: { data: { email: string, title: string, name: string } }) {
        try {
            const { email, title, name } = data.data;
            
            const result = await this.userService.updateDetails({ email, name, title });
            return result;
        } catch (error) {
            console.error("Error editing user details:", error);
            throw new Error("Error occurred while editing user details");
        }
    }
    
    async fetchedDetails(data:{userId:string, followerId:string}){
        try {
            
            const result = await this.userService.fetchUserDetails(data);
            return result;
        } catch (error) {
            console.error("Error fetching user details:", error);
            throw new Error("Error occurred while fetching user details");
        }
    }

    async fetchedUserInfo(data:{userId:string}){
        try {
            const result = await this.userService.fetchUserInfo(data);
            return result;
        } catch (error) {
            console.error("Error fetching user infos:", error);
            throw new Error("Error occurred while fetching user infos");
        }
    }

    async editedUserInfo(data: { data: { email: string, phone: string, education: string[], place: string[] } }){
        try {
            const { email, phone, education, place } = data.data;
            
            const result = await this.userService.editUserInfo({ email, phone, education, place });
            return result;
        } catch (error) {
            console.error("Error edit user infos:", error);
            throw new Error("Error occurred while edit user infos");
        }
    }

    async addedUserSkills(data:{email:string, skills:string[]}){
        try {
            
            const {email, skills} = data;
            const result = await this.userService.addSkills({email,skills})
            return result;
        } catch (error) {
            console.error("Error add user skills:", error);
            throw new Error("Error occurred while adding user skills");
        }
    }

    async fetchedSkills(data:{userId:string}){
        try {
            const result = await this.userService.fetchSkills(data);
            return result;
        } catch (error) {
            console.error("Error fetching user skills:", error);
            throw new Error("Error occurred while fetching user skills");
        }
    }

    async editedSkills(data:{email:string, skills:string[]}){
        try {
            const email = data.email;
            const skills = data.skills;
            const result = await this.userService.editSkills(email,skills)
            return result;
        } catch (error) {
            console.error("Error editing user skills:", error);
            throw new Error("Error occurred while editing user skills");
        }
    }

    async addedCv(data: { email: string, cvFile: { buffer: { type: string, data: number[] }, originalname: string } }) {
        try {
            const result = await this.userService.addCV(data);
            return result;
        } catch (error) {
            console.error("Error adding user cv:", error);
            throw new Error("Error occurred while adding user cv");
        }
    }

    async getCvs(data:{email: string}){
        try {
            const email = data.email;
            const result = await this.userService.getCvs(email)
            return result;
        } catch (error) {
            console.error("Error getting user cv:", error);
            throw new Error("Error occurred while getting user cv");
        }
    } 

    async deleteCv(data:{url:string, email: string}){
        try {
            
            const url = data.url;
            const email = data.email;
            const result = await this.userService.deleteCv(url,email);
            return result;
        } catch (error) {
            console.error("Error removing user cv:", error);
            throw new Error("Error occurred while removing user cv");
        }
    }

    async addProfile(data:{email:string, image:{buffer:{type:string, data:number[]},originalname:string}}){
        try {
            const result = await this.userService.addProfile(data)
            return result;
        } catch (error) {
            console.error("Error adding user profile:", error);
            throw new Error("Error occurred while adding user profile");
        }
    }

    async fetchedProfile(data:{userId:string}){
        try {
            const userId = data.userId;
            const result = await this.userService.getProfile(userId);
            
            return result;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw new Error("Error occurred while fetching user profile");
        }
    }

    async addCoverPic(data:{email:string, image:{buffer:{type:string, data:number[]},originalname:string}}){
        try {
            const result = await this.userService.addCoverImg(data);
            return result;
        } catch (error) {
            console.error("Error adding user cover image:", error);
            throw new Error("Error occurred while adding user cover image");
        }
    }

    async fetchCoverImg(data:{userId:string}){
        try {
            const userId = data.userId;
            
            const result = await this.userService.getCoverImg(userId);
            return result;
        } catch (error) {
            console.error("Error fetching user coverimg:", error);
            throw new Error("Error occurred while fetching user coverimg");
        }
    }

    async fetchDataForPost(data: { userIds: string[] }): Promise<{ success: boolean; message: string; data?: IUserPostDetails[] }> {
        try {
    
            const results = await Promise.all(data.userIds.map(async (userId) => {
                return this.userService.fetchUserDatasForPost(userId);
            }));
    
            const successfulResults = results.filter(result => result.success).map(result => result.data);
    
            if (successfulResults.length > 0) {
                return {
                    success: true,
                    message: "Data found",
                    data: successfulResults as IUserPostDetails[]
                };
            } else {
                return {
                    success: false,
                    message: "No data found"
                };
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw new Error("Error occurred while fetching user data");
        }
    }
   
    async addFollowers(data: { userId: string; followerId: { id: string } }): Promise<{ success: boolean; message: string }> {
        try {
            const { userId, followerId: { id: followerId } } = data;
            
            const result = await this.userService.addFollowers(userId, followerId);
            return result;
        } catch (error) {
            console.error("Error following user:", error);
            throw new Error("Error occurred while following user");
        }
    }
    
    async unfollow(data:{userId:string, followerId:string}):Promise<{success:boolean,message:string}>{
        try {
            const userId = data.userId;
            const followerId = data.followerId;
            const result = await this.userService.removeFollowers(userId,followerId)
            return result
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw new Error("Error occurred while unfollowing user");
        }
    }

    async searchUsers(data:{searchQuery:string}){
        try {
            const searchQuery = data.searchQuery;
            
            const result = await this.userService.searchUser(searchQuery);
            return result;            
        } catch (error) {
            console.error("Error searching users:", error);
            throw new Error("Error occurred while searching users");
        }
    }

    async logout(data:{userId:string}){
        try {
            const userId = data.userId;
            const result = await this.userService.logout(userId);
            return result;
        } catch (error) {
            console.error("Error logout users:", error);
            throw new Error("Error occurred while logout users");
        }
    }
    
    async friendSuggestions(data:{userId:string}){
        try {
            const userId = data.userId;
            const result = await this.userService.friendSuggestion(userId);
            return result;
        } catch (error) {
            console.error("Error finding friend suggestion:", error);
            throw new Error("Error occurred while finding friend suggestion");
        }
    }
}

export const userController = new UserController();
