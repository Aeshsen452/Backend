import { Router } from "express";
import Authorization from "../../../../Middleware/Authorization.js"
import { createdata,getallfilters,getfilterdetails,updatelistingdata,deletelistingfilter} from "./Comparablerank.controller.js";

const comparableRankRouter = Router();

comparableRankRouter.post("/comparableRank",Authorization,createdata);
comparableRankRouter.get("/comparableRankfiters",Authorization,getallfilters);
comparableRankRouter.get("/comparablerank/:filterid",Authorization,getfilterdetails);
comparableRankRouter.patch("/comparablerank/:filterid",Authorization,updatelistingdata);
comparableRankRouter.delete("/comparablerank",Authorization,deletelistingfilter);



export default comparableRankRouter;