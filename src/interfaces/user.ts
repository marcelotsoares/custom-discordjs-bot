import { Document, Types } from "mongoose";
import { BeAnObject, IObjectWithTypegooseFunction } from "@typegoose/typegoose/lib/types";
import { BotUser } from "models/bot-user";

export interface IUser {
    user: UserModel;
}

export interface ICreateUser {
    discordId: string;
    discordName: string;
}

export interface IUserIventory extends IUser {
    itemId: string;
}

export interface IUserPayment extends IUser {
    coins: number;
}

export interface IUserLevel extends IUser {
    messageLength: number;
}

export type UserModel = Document<any, BeAnObject, BotUser> & BotUser & IObjectWithTypegooseFunction & {
    _id: Types.ObjectId;
}
