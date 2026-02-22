import { Router } from "express";
import Authorization from "../../../../Middleware/Authorization.js"
import { createdata,getallfilters,getfilterdetails,updatelistingdata,deletelistingfilter} from "./comparable.controller.js";

const comparableAjustmentRouter = Router();

comparableAjustmentRouter.post("/comparableadjustment",Authorization,createdata);
comparableAjustmentRouter.get("/comparableAjustmentfiters",Authorization,getallfilters);
comparableAjustmentRouter.get("/comparableadjustment/:filterid",Authorization,getfilterdetails);
comparableAjustmentRouter.patch("/comparableadjustment/:filterid",Authorization,updatelistingdata);
comparableAjustmentRouter.delete("/comparableadjustment",Authorization,deletelistingfilter);



export default comparableAjustmentRouter;