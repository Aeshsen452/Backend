import { Router } from "express";
import Authorization from "../../Middleware/Authorization.js";
import {createanalysis,totalanalysis,existid} from "./Analysis.controller.js"
const AnalysisRouter = Router()

AnalysisRouter.post("/Analysis",Authorization,createanalysis);
AnalysisRouter.get("/Analysis",Authorization,totalanalysis);
AnalysisRouter.get("/Analysis/:Lisitngid",Authorization,existid);

export default AnalysisRouter