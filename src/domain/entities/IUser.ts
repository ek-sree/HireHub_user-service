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
    cv?:string[];
    status?:boolean;
    resume?:string[];
    avatar?:string;
    profileTitle?:string;
    created_at?:Date;
}

