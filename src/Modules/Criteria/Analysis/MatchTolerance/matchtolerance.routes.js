import { Router } from "express";
import Authorization from "../../../../Middleware/Authorization.js"
import {createdata,getallfilters,getfilterdetails,updatelistingdata,deletelistingfilter} from "./matchtolerance.controller.js"


const MatchToleranceRouter = Router();

MatchToleranceRouter.post("/matchtolerance",Authorization,createdata);
MatchToleranceRouter.get("/MatchTolerancefiters",Authorization,getallfilters);
MatchToleranceRouter.get("/matchtolerance/:filterid",Authorization,getfilterdetails);
MatchToleranceRouter.patch("/matchtolerance/:filterid",Authorization,updatelistingdata);
MatchToleranceRouter.delete("/matchtolerance",Authorization,deletelistingfilter);




export default MatchToleranceRouter;