export interface IUserDetails {
    name: string;
    profileTitle?: string;
}

export interface IUserInfo {
    email?:string;
    phone?:string;
    place?:string[] | undefined;
    education?:string[] | undefined;
} 
export interface IUserPostDetails {
    name?: string;
    avatar?: {
        imageUrl: string;
        originalname: string;
    };
}
