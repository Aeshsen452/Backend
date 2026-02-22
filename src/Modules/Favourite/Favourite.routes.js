import { Router } from "express";
import Authorization from "../../Middleware/Authorization.js";
import {createFavourirte,totalfavouirte,getidexists,getallfavouirtes} from "./Favourite.controller.js"
const FavouriteRouter = Router()

FavouriteRouter.post("/Favourite",Authorization,createFavourirte);
FavouriteRouter.get("/TotalFavourite",Authorization,totalfavouirte);
FavouriteRouter.get("/Favourite/:listingid",Authorization,getidexists);
FavouriteRouter.get("/Favourite",Authorization,getallfavouirtes);

export default FavouriteRouter