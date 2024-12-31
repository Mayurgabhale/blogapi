import { User } from "src/user/modules/user.interface";

export interface BlogEntry{
    id?:number;
    title?:string;
    slug?: string;
    description?:string;
    createdAt?:Date;
    updatedAt?:Date;
    author?:User;
}