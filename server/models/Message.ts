import {Schema, model} from 'mongoose';

export interface IMessage {
    from: String,
    to: String,
    text: String,
    created_at: Date
}

const MessageSchema = new Schema<IMessage>({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    text: {
        type: String
        // required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export const Message = model<IMessage>('message', MessageSchema);