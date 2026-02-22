import { Router } from "express";
import { signupUser } from "./user.controller.js";
import Authorization from "../../Middleware/Authorization.js";


const userRouter = Router();

userRouter.post("/signup",Authorization,signupUser);



export default userRouter