import { Schema,model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
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
    otp : {
        type:Number,
        default:0
    },
    otpCreated:{
        type:Date,
    },
    platformuser : {
        type:String,
        default:"user"
    }
},{timestamps:true});


const usermodel = model("user",userSchema);

export default  usermodel