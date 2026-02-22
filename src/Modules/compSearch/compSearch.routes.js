import { Router } from "express";
import Authorization from "../../Middleware/Authorization.js";
import { populateCompSearchData ,saveSearchComp} from "./compSearch.controller.js";

const compSearchRouter = Router()

compSearchRouter.get("/compsearch/", Authorization, populateCompSearchData);
compSearchRouter.post("/compsearch/fav",Authorization,saveSearchComp)


export default compSearchRouter