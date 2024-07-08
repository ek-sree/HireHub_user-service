import { UserService } from '../../application/use-case/user';
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
    
    async fetchedDetails(data:{email:string}){
        try {
            console.log("sda...",data);
            
            const result = await this.userService.fetchUserDetails(data);
            return result;
        } catch (error) {
            console.error("Error fetching user details:", error);
            throw new Error("Error occurred while fetching user details");
        }
    }

    async fetchedUserInfo(data:{email:string}){
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

    async fetchedSkills(data:{email:string}){
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
    
}

export const userController = new UserController();
