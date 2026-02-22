 import { Router } from "express";
 import {changepassword,resetpassword} from "./changepassword.controller.js"
 import Authorization from "../../../Middleware/Authorization.js";
 
 const changepassRouter = Router();
 
 changepassRouter.patch("/changepassword",Authorization,changepassword);
 changepassRouter.patch("/resetpassword",Authorization,resetpassword);
 
 
 export default changepassRouter;