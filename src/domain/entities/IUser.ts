export interface IUser {
    _id?:string;
    email: string;
    name: string;
    phone?: string;
    password: string;
    // googleId?: string;
    isAdmin?:boolean;
    coverphoto?:string;
    education?:string[];
    skills?:string[];
    status?:boolean;
    resume?:string[];
    avatar?:string;
    created_at?:Date;
}
