import { IUserRepository } from './IUserRepository';
import { IUser } from '../entities/IUser';
import { IUserDocument, User } from '../../model/User';
import bcrypt from 'bcrypt';
import { IUserDetails, IUserInfo, IUserPostDetails } from '../entities/IUserDetails';
import mongoose from 'mongoose';

export class UserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email }).exec();
            if(!user){
                return null;
            }else{
                user.isOnline=true;
                await user.save();
                return user;
            }
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding user by email: ${err.message}`);
        }
    }

    async save(user: IUser): Promise<IUser> {
        try {
            console.log("sasasasdasd", user);
            
            const hashedPassword = await bcrypt.hash(user.password, 10);
            console.log("hash0", hashedPassword);
            
            const userWithHashedPassword = { ...user, password: hashedPassword };
            const { _id, ...userWithoutId } = userWithHashedPassword;
            const newUser = new User(userWithoutId);
            console.log("user ethiyoo", newUser);
            newUser.isOnline=true;
            await newUser.save();
            console.log("saved and return", newUser);
            
            return newUser;
        } catch (error) {
            const err = error as Error;
            console.error("Error saving user:", err);
            throw new Error(`Error saving user: ${err.message}`);
        }
    }
    

    async checkUser(email: string, password: string): Promise<{ success: boolean, message: string, user_data?: IUser }> {
        try {
            const user_data = await User.findOne({ email }).exec();
            if (!user_data) {
                return { success: false, message: "Email incorrect" };
            }
    
            const isPasswordMatch = await bcrypt.compare(password, user_data.password);
            if (!isPasswordMatch) {
                return { success: false, message: "Password incorrect" };
            }
    
            if (user_data.status === true) {
                return { success: false, message: "Your account is blocked" };
            }
    user_data.isOnline=true
    await user_data.save();
            return { success: true, message: "User found", user_data };
        } catch (error) {
            const err = error as Error;
            throw new Error(`Error finding user by email and password: ${err.message}`);
        }
    }

    async addTitle(email: string, title: string): Promise<{success: boolean, message: string, result?: string} > {
        try {
            console.log("emil for add title",email);
            console.log("title for add title",title);
            const user = await User.findOne({email})
            if(!user){
                return {success: false, message:"no user found"}
            }
            user.profileTitle = title;
            const updateUser = await user.save()
            if(!updateUser){
                return {success: false, message:"can't add title right now!!"}
            }
            return{success:true, message:"Title added succesfullt", result:title}
        } catch (error) {
            console.log("error saving title",error);
            const err = error as Error;
            throw new Error(`Error saving Profile title${err.message}`);
        }
    }
    
    async editDetails (email: string, name: string, title: string): Promise<{success: boolean, message: string, result?: { name: string, profileTitle: string }}> {
        try {
            console.log("db repo",email);
            
            const user = await User.findOne({email});
            if(!user){
                console.log("User doesnt found");
                return {success: false, message:"User not found"};
            }
            console.log("name", name);
            
            user.name = name;
            user.profileTitle = title || '';
            const updatedUser = await user.save();
            return {success: true, message:"details updated", result: { name: updatedUser.name, profileTitle: updatedUser.profileTitle || ''}}
        } catch (error) {
            console.log("error editing details",error);
            const err = error as Error;
            throw new Error(`Error editing user details${err.message}`);
        }
    }

    async findDetails(userId: string, followerId:string): Promise<{success:boolean,message:string, result?:IUserDetails}> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return { success: false, message: "Invalid user ID format" };
            }
    
            const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            
            const isFollowing = user.followers?.some(follower => follower.toString() === followerId);
            
            const result = { name: user.name, title: user.profileTitle, followers: user.followers, following: user.following , isFollowing};
    
            return { success: true, message: "Found data", result };
        } catch (error) {
            console.log("error fetching details",error);
            const err = error as Error;
            throw new Error(`Error fetching user details${err.message}`);
        }
    }

    async findUserInfo(userId:string): Promise<{success: boolean, message:string, result?:IUserInfo}>{
        try {
            const user = await User.findOne({_id: new mongoose.Types.ObjectId(userId)});
            if(!user){
                return {success: false, message:"User not found"};
            }
            const userInfo: IUserInfo = {
                email: user.email,
                phone: user.phone || '',
                place: user.place || [], 
            education: user.education || []
            } 
            
            
            return {success: true, message:"Found user", result:userInfo}
        } catch (error) {
            console.log("error fetching user infos",error);
            const err = error as Error;
            throw new Error(`Error fetchinguser infos ${err.message}`);
        }
    }

    async editInfo(userInfo: IUserInfo): Promise<{ success: boolean, message: string, data?: IUserInfo }> {
        try {
            console.log("repo userinfo", userInfo);
            const { email, phone, education, place } = userInfo;
            
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            
            if (phone !== undefined) {
                user.phone = phone;
            }
            if (education) {
                user.education = education.length ? education : []; 
            }
            if (place) {
                user.place = place.length ? place : [];  
            }
    
            const updatedUser = await user.save();
            const updatedUserInfo: IUserInfo = {
                email: updatedUser.email,
                phone: updatedUser.phone || '',
                place: updatedUser.place || [],
                education: updatedUser.education || []
            };
    
            return { success: true, message: "User info updated successfully", data: updatedUserInfo };
        } catch (error) {
            console.log("error editing user infos", error);
            const err = error as Error;
            throw new Error(`Error editing user infos ${err.message}`);
        }
    }

    async createSkills(email:string, skills:{skills:{skills:string[]}}): Promise<{success: boolean, message:string, data?:string[]}>{
        try {
            console.log("email repo", email, skills.skills.skills,"-=-=-");
            const user = await User.findOne({email});
            if(!user){
                return { success: false, message:"User not found"}
            }
            
            user.skills = [...skills.skills.skills];
            const updatedUser = await user.save();
            return { success: true, message:"add skills", data:updatedUser.skills}
        } catch (error) {
            console.log("error adding user skills", error);
            const err = error as Error;
            throw new Error(`Error adding user skills ${err.message}`);
        }
        }

    async findSkills(userId:string):Promise<{success:boolean, message:string, data?:string[]}>{
        try {
            
            const user = await User.findOne({_id: new mongoose.Types.ObjectId(userId)});
            if(!user){
                return {success: false, message:"user not found"};
            }
            const data = user.skills;
            return {success: true, message:"Data found", data}
        } catch (error) {
            console.log("error fetching user skills", error);
            const err = error as Error;
            throw new Error(`Error fetching user skills ${err.message}`);
        }
    }

    async updateSkills(email:string, skills:string[]): Promise<{success: boolean, message:string, data?:string[]}>{
        try {
            const user = await User.findOne({email});
            if(!user){
                return{success:false, message:"User not found"}
            }
            user.skills = skills; 
            const updatedUser = await user.save();
            return {success:true, message:"User updated", data:updatedUser.skills}
        } catch (error) {
            console.log("error editing user skills", error);
            const err = error as Error;
            throw new Error(`Error editing user skills ${err.message}`);
        }
    }

    async uploadCv(email: string, fileUrls: string, realFileName: string): Promise<{ success: boolean, message: string, data?: string }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "user not found" };
            }
            if (!user.cv) {
                user.cv = [];
            }
            user.cv.push({ url: fileUrls, filename: realFileName });
            const updateDetails = await user.save();
            console.log("uploaded successfully", updateDetails);
    
            return { success: true, message: "Updated successfully", data: updateDetails.cv?.[0].url || '' };
        } catch (error) {
            console.log("error adding user cv", error);
            const err = error as Error;
            throw new Error(`Error adding user cv ${err.message}`);
        }
    }
    
    

    async findCv(email: string): Promise<{ success: boolean, message: string, cvUrls?: { url: string, filename: string }[] }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
            return { success: true, message: "cv urls found", cvUrls: user.cv };
        } catch (error) {
            console.log("error fetching user cv", error);
            const err = error as Error;
            throw new Error(`Error fetching user cv ${err.message}`);
        }
    }
    
    async removeCv(url:string, email:string): Promise<{success:boolean, message:string}>{
        try {
            console.log("gettinf data in db ??");
            
            const user = await User.findOne({email});
            if(!user) {
                return {success: false, message:"user not found"}
            }
            console.log("..........");
            
            if (!user.cv) {
                return { success: false, message: "No CVs found for the user" };
            }
            const fileName = url.split('/').pop()?.split('?')[0];
        console.log("Extracted file name: ", fileName);

        const cvIndex = user.cv.findIndex(cv => cv.url === fileName);
            if(cvIndex === -1){
                return { success: false, message: "CV not found" };
            }

            user.cv.splice(cvIndex, 1);
             await user.save();
             console.log("success db remove");
             
             return {success:true, message:"delete successfully"}

        } catch (error) {
            console.log("error removing user cv", error);
            const err = error as Error;
            throw new Error(`Error removing user cv ${err.message}`);
        }
    }

    async saveProfile(email: string, image: string, originalname: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return { success: false, message: "User not found" };
            }
    
            user.avatar = { imageUrl: image, originalname }; 
            
            const savedUser = await user.save();
            return { success: true, message: "Url saved successfully", data: savedUser.avatar };
        } catch (error) {
            console.log("Error saving profile image", error);
            const err = error as Error;
            throw new Error(`Error saving profile image: ${err.message}`);
        }
    }
    
    

   

        async getProfileImage(userId: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId format");
        }

        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return { success: false, message: "User not found" };
        }

        const userAvatar = user.avatar || { imageUrl: '', originalname: '' };
        return { success: true, message: "User profile image found", data: userAvatar };
    } catch (error) {
        console.log("Error fetching profile img", error);
        const err = error as Error;
        throw new Error(`Error fetching profile img ${err.message}`);
    }
}

    
async saveCoverImg(email: string, image: string, originalname: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
    try {
        const result = await User.findOneAndUpdate(
            { email },
            { $set: { 'coverphoto.imageUrl': image, 'coverphoto.originalname': originalname } },
            { new: true }
        );

        if (!result) {
            return { success: false, message: "No user found" };
        }

        return { success: true, message: "Data saved successfully", data: result.coverphoto };
    } catch (error) {
        console.log("Error saving Cover image", error);
        const err = error as Error;
        throw new Error(`Error saving cover image: ${err.message}`);
    }
}


async getCoverImage(userId: string): Promise<{ success: boolean; message: string; data?: { imageUrl: string; originalname: string } }> {
    try {
       
       if (!userId) {
        return { success: false, message: "Invalid user ID" };
    }

        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return { success: false, message: "No user found" };
        }
        const userCoverImg = user.coverphoto || { imageUrl: '', originalname: '' };
        return { success: true, message: "Found data", data: userCoverImg };
    } catch (error) {
        console.log("Error fetching cover img", error);
        const err = error as Error;
        throw new Error(`Error fetching cover img ${err.message}`);
    }
}
    
async findUserDetailsForPost(userId: string): Promise<{ success: boolean; message: string; data?: IUserPostDetails }> {
    try {
        const user = await User.findById({_id: new mongoose.Types.ObjectId(userId)});
        if (!user) {
            return { success: false, message: "No user found" };
        }

        const datas: IUserPostDetails = {
            id: user._id,
            name: user.name,
            avatar: {
                imageUrl: user.avatar?.imageUrl || '',
                originalname: user.avatar?.originalname || '',
            },
            isOnline:user.isOnline
        };

        return { success: true, message: "Data found", data: datas };
    } catch (error) {
        console.log("Error fetching user data", error);
        const err = error as Error;
        throw new Error(`Error fetching user data: ${err.message}`);
    }
}
    
async createFollow(userId: string, followerId: string): Promise<{ success: boolean, message: string }> {
    try {

        const followerUser = await User.findOne({ _id: new mongoose.Types.ObjectId(followerId) });
        if (!followerUser) {
            return { success: false, message: "No follow user found" };
        }
        if (!followerUser.followers) {
            followerUser.followers = [];
        }
        if (!followerUser.followers.includes(userId)) {
            followerUser.followers.push(userId);
        }
        await followerUser.save();

        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return { success: false, message: "No following user found" };
        }
        if (!user.following) {
            user.following = [];
        }
        if (!user.following.includes(followerId)) {
            user.following.push(followerId);
        }
        await user.save();

        return { success: true, message: "Followers and following list updated" };
    } catch (error) {
        console.log("Error following", error);
        const err = error as Error;
        throw new Error(`Error following: ${err.message}`);
    }
}


async deleteFollow(userId:string, followerId:string): Promise<{success:boolean, message:string}>{
    try {
        const followerUser = await User.findOne({_id: new mongoose.Types.ObjectId(followerId)});
        if(!followerUser){
            return {success:false,  message:"No user found"}
        }
        followerUser.followers = followerUser.followers?.filter((id) => id.toString() !== userId);
        
        await followerUser.save();
        const user = await User.findOne({_id: new mongoose.Types.ObjectId(userId)});
        if(!user){
            return {success:false, message:"No follow user found"}
        }
        user.following = user.following?.filter((id)=>id.toString() !== followerId);
        
        await user.save();
        return {success:true, message:"unfollowed successFully"}
    } catch (error) {
        console.log("Error unfollowing", error);
        const err = error as Error;
        throw new Error(`Error unfollowing: ${err.message}`);
    }
}

async searchUsers(searchQuery: string): Promise<{ success: boolean, message: string, data?: IUserPostDetails[] }> {
    try {
        console.log("searchQuery:", searchQuery);

        const query: any = { status: false };
        if (searchQuery) {
            query.name = { $regex: new RegExp(searchQuery, 'i') };
        }

        const users = await User.find(query); 

        if (!users || users.length === 0) {
            return { success: false, message: "No users found" };
        }

        return { success: true, message: "Data found", data: users as IUserPostDetails[] };
    } catch (error) {
        console.log("Error searching users:", error);
        const err = error as Error;
        throw new Error(`Error searching users: ${err.message}`);
    }
} 

async logoutUser(userId:string):Promise<{success:boolean, message:string,  data?: { isOnline: boolean, lastSeen: Date }}>{
    try {
        const user = await User.findOne({_id: new mongoose.Types.ObjectId(userId)});
        if(!user){
            return {success:false, message:"No user found"}
        }
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
        return {success:true, message:"isOnline is updated", data: { isOnline: user.isOnline, lastSeen: user.lastSeen }}
    } catch (error) {
        console.log("Error logout user:", error);
        const err = error as Error;
        throw new Error(`Error logout users: ${err.message}`);
    }
}

async findFriends(userId: string): Promise<{ success: boolean; message: string; data?: IUserPostDetails[] }> {
    try {
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return { success: false, message: "No user found" };
        }

        let suggestedFriends: IUserDocument[] = [];

        if (user.skills && user.skills.length > 0) {
            suggestedFriends = await User.find({
                $and: [
                    { _id: { $ne: user._id } },
                    { skills: { $elemMatch: { $in: user.skills } } },
                    { _id: { $nin: user.following || [] } }
                ]
            }).limit(4);
        }

        if (suggestedFriends.length < 4 && user.followers && user.followers.length > 0) {
            const friendsOfFriends = await User.find({
                $and: [
                    { _id: { $ne: user._id } },
                    { _id: { $nin: [...(user.following || []), ...suggestedFriends.map(f => f._id)] } },
                    { followers: { $in: user.followers } }
                ]
            }).limit(4 - suggestedFriends.length);

            suggestedFriends = [...suggestedFriends, ...friendsOfFriends];
        }

        if (suggestedFriends.length < 4) {
            const randomUsers = await User.aggregate([
                {
                    $match: {
                        $and: [
                            { _id: { $ne: new mongoose.Types.ObjectId(userId) } },
                            { _id: { $nin: [...(user.following || []), ...suggestedFriends.map(f => f._id)] } }
                        ]
                    }
                },
                { $sample: { size: 4 - suggestedFriends.length } }
            ]);

            suggestedFriends = [...suggestedFriends, ...randomUsers];
        }

        const suggestedFriendsDetails: IUserPostDetails[] = suggestedFriends.map(friend => ({
            id: friend._id ? friend._id.toString() : '',
            name: friend.name,
            avatar: friend.avatar,
            isOnline: friend.isOnline
        }));
        return {
            success: true,
            message: "Friend suggestions found",
            data: suggestedFriendsDetails
        };

    } catch (error) {
        console.log("Error find friend suggestion:", error);
        const err = error as Error;
        throw new Error(`Error find friend suggestion: ${err.message}`);
    }
}

async findFollowers(userId: string): Promise<{ success: boolean, message: string, data?: IUserPostDetails[] }> {
    try {
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) }).select('followers');
        if (!user) {
            return { success: false, message: "No user found" };
        }

        const followerIds = user.followers;
        if (!followerIds || followerIds.length === 0) {
            return { success: true, message: "No followers found", data: [] };
        }

        const followersList = await User.find({ _id: { $in: followerIds } }).select('name avatar');
        if (!followersList) {
            return { success: false, message: "No followers data found" };
        }
        const data: IUserPostDetails[] = followersList.map(follower => ({
            id: follower._id.toString(), 
            name: follower.name,
            avatar: follower.avatar
        }));

        return { success: true, message: "Followers found", data };
    } catch (error) {
        console.log("Error finding followers list:", error);
        const err = error as Error;
        throw new Error(`Error finding followers list: ${err.message}`);
    }
}

    
}
