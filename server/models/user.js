import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 64
    },
    picture: {
        type: String,
        default: "/avatar.png"
    },
    role: {
        type: [String],
        default: ["Subscriber"],
        enum: ["Subscriber", "Provider", "Requester", "Admin"]
    },
    passwordResetCode: {
        type: String,
        default: ''
    }
},
{ timestamps: true }
)

export default mongoose.model("User", userSchema);