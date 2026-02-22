import { Router } from "express";
import {signupAdmin,loginAdmin,deleteadmin,getprofile,
    createadmin,getallmanageuser,deletemanageuser,changepassword} from "./admin.controller.js"
import Authorization from "../../Middleware/Authorization.js";


const adminRouter = Router();

adminRouter.post("/admin/signup",signupAdmin);
adminRouter.post("/admin/login",loginAdmin);
adminRouter.get("/getprofiledetail",Authorization,getprofile);
adminRouter.delete("/",Authorization,deleteadmin);
adminRouter.post("/admin/createadmin",Authorization,createadmin);
adminRouter.get("/admin/manageuser",Authorization,getallmanageuser)
adminRouter.delete("/admin/deletemanageuser",Authorization,deletemanageuser)
adminRouter.patch("/admin/changeuserpassword",Authorization,changepassword)


export default adminRouter;