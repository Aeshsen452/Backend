import { Router } from "express";
import {generateOtp,verifyOtp} from "./otp.controller.js"

const otpRouter = Router();

otpRouter.post("/generateotp",generateOtp);
otpRouter.post("/verifyotp",verifyOtp);


export default otpRouter;