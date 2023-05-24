import {Schema, model} from 'mongoose';

export interface IUser {
    username: String
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true
    }
});

export const User = model<IUser>('user', UserSchema);