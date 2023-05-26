import {Schema, model} from 'mongoose';

export interface IUser {
    username: String,
    uuid: String,
    isOnline: Boolean
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    isOnline: {
        type: Boolean,
        default: false
    }
});

export const User = model<IUser>('user', UserSchema);