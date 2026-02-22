import { getimagesurls } from "./Images.controller.js";
import { Router } from "express";
import Authorization from "../../Middleware/Authorization.js";
const ShowimagesRouter = Router();

ShowimagesRouter.get("/getimages/:mlslsitingid",Authorization,getimagesurls);


export default ShowimagesRouter