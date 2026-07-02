import mongoose from "mongoose";
import { refreshToken } from "../controllers/auth.Controller.js";

const sessionSchema = new mongoose.Schema({
    user :{
        type : String,
        required : [true, "user is required"]
    },
    refreshTokenHash :{
        type : String,
        required : [true, "refreshtoken is required"]
    },
    ip : {
        type : String,
        required : [true, "ip address is required"]
    },
    useragent : {
        type : String,
        required : [true, "User agent is required"]
    },
    revoked: {
        type : Boolean,
        default : false
    }
},{
    timestamps : true
})

const sessionModel = mongoose.model('session',sessionSchema);

export default sessionModel;