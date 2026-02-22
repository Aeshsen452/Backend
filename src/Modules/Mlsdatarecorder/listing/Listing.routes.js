import { Router } from "express";
import {creatingLisitngdata,updateLisitngdata} from "./Listing.controller.js"
const LisitngMlsRouter = Router();

LisitngMlsRouter.post("/listingmls/active",creatingLisitngdata)
LisitngMlsRouter.patch("/listingmls/active/:Listingid",updateLisitngdata)

export default LisitngMlsRouter;