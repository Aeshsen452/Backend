import { Router } from "express";
import Authorization from "../../Middleware/Authorization.js";
import { createdead,getidexists } from "./dead.controller.js";
const DeadRouter = Router()

DeadRouter.post("/dead",Authorization,createdead);
DeadRouter.get("/dead/:listingid",Authorization,getidexists);

export default DeadRouter