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
            console.log("data in controller", data);
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
            console.log("Received data for edit user details:", data);
            const { email, title, name } = data.data;
            console.log("Destructured values:", email, title, name);
            
            const result = await this.userService.updateDetails({ email, name, title });
            console.log("Update details result:", result);
            return result;
        } catch (error) {
            console.error("Error editing user details:", error);
            throw new Error("Error occurred while editing user details");
        }
    }
    
    async fetchedDetails(data:{userId:string}){
        try {
            console.log("daraaaaaaa",data);
            
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
            console.log("logging data controller", data);
            const { email, phone, education, place } = data.data;
            console.log("Destructured values:", email, phone, education, place);
            
            const result = await this.userService.editUserInfo({ email, phone, education, place });
            return result;
        } catch (error) {
            console.error("Error edit user infos:", error);
            throw new Error("Error occurred while edit user infos");
        }
    }

    async addedUserSkills(data:{email:string, skills:string[]}){
        try {
            console.log("dddddddd",data);
            
            const {email, skills} = data;
            console.log("destructure", email, skills);
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
            console.log("remove data", data);
            
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
            console.log("get cover img",userId);
            
            const result = await this.userService.getCoverImg(userId);
            return result;
        } catch (error) {
            console.error("Error fetching user coverimg:", error);
            throw new Error("Error occurred while fetching user coverimg");
        }
    }

    async fetchDataForPost(data: { userIds: string[] }): Promise<{ success: boolean; message: string; data?: IUserPostDetails[] }> {
        try {
            console.log("man pleaseee", data);
    
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
    
    
}

export const userController = new UserController();
