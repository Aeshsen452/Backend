import { Router } from "express";
import { getresultvalue,testingresultspage} from "./Results.controller.js";
import Authorization from "../../Middleware/Authorization.js"
const ResultRouter = Router();

ResultRouter.get("/result",Authorization,getresultvalue);
ResultRouter.get("/res",testingresultspage);


export default ResultRouter;