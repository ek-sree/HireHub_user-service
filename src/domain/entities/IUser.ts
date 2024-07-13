export interface IUser {
    _id?:string;
    email: string;
    name: string;
    phone?: string;
    password: string;
    isAdmin?:boolean;
    coverphoto?:string;
    education?:string[];
    place?:string[];
    skills?:string[];
    cv?: { url: string, filename: string }[];
    status?:boolean;
    resume?:string[];
    avatar?: { imageUrl: string; originalname: string };
    profileTitle?:string;
    created_at?:Date;
}

