import { Schema,model } from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new Schema({
    name : {
        type:String,
        default:"admin"
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage : {
        type:String,
        default:"images/Admindefaultpic.png"
    },
    otp : {
        type:Number,
        default:0
    },
    otpCreated:{
        type:Date,
    },
    platformuser : {
        type:String,
        default:"admin"
    }
},{timestamps:true});


const adminmodel = model("admin",adminSchema);

export default  adminmodel