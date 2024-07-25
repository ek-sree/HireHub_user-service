export interface IUser {
    _id?: string;
    email: string;
    name: string;
    phone?: string;
    password: string;
    isAdmin?: boolean;
    coverphoto?: { imageUrl: string; originalname: string };
    education?: string[];
    place?: string[];
    skills?: string[];
    cv?: { url: string, filename: string }[];
    status?: boolean;
    resume?: string[];
    avatar?: { imageUrl: string; originalname: string };
    profileTitle?: string;
    followers?: string[];
    following?: string[];
    isOnline?: boolean;
    lastSeen?: Date;
    created_at?: Date;
}
