import Authorization from "../../../Middleware/Authorization.js";
import { getmatchinglocationdata,savelocationfilters,getallfilters } from "./Criteria.controller.js";
import { Router } from "express";

const LocationRouter = Router();

LocationRouter.post("/getlocationdata",Authorization,getmatchinglocationdata);
LocationRouter.post("/savelocationdata",Authorization,savelocationfilters);
LocationRouter.get("/Location/getallfilters",Authorization,getallfilters);
// LocationRouter.post("/location/getlatlong",Authorization,getlatlong);
export default LocationRouter  