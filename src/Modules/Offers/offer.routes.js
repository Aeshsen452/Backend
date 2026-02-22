import { Router } from "express";
import Authorization from "../../Middleware/Authorization.js"
import { createoffer,offerfiltername } from "./offer.controller.js";

const offerRouter = Router();

offerRouter.post("/createoffer",Authorization,createoffer);
offerRouter.get("/getofferfiltername/:ListingId",Authorization,offerfiltername);



export default offerRouter;