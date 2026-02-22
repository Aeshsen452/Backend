import { Router } from "express";
import {updateProfile} from "./updateprofile.controller.js"
import Authorization from "../../../Middleware/Authorization.js"
import uploads from "../../../Middleware/Multer.js";

const updateRouter = Router();

updateRouter.patch("/updateprofile",Authorization,uploads.single("profile"),updateProfile);




export default updateRouter;