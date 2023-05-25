"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
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
exports.Message = (0, mongoose_1.model)('message', MessageSchema);
