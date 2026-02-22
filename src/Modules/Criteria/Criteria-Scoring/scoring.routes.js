import { Router } from "express";
import {Scoringdata,getallfilters,getfilterdetails,updatelistingdata,deletelistingfilter} from "./scoring.controller.js"
import Authorization from "../../../Middleware/Authorization.js"

const ScoringRouter = Router();

ScoringRouter.post("/addscoringdata",Authorization,Scoringdata);
ScoringRouter.get("/scoringfilters",Authorization,getallfilters);
ScoringRouter.get("/scoring/:filterid",Authorization,getfilterdetails);
ScoringRouter.patch("/scoring/:filterid",Authorization,updatelistingdata);
ScoringRouter.delete("/scoring",Authorization,deletelistingfilter);



export default ScoringRouter;