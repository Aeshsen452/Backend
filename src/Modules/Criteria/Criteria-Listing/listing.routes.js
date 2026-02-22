import { Router } from "express";
import Authorization from "../../../Middleware/Authorization.js";
import { createListingdata,getallfilters,getfilterdetails,updatelistingdata,deletelistingfilter} from "./listing.controller.js";

const ListingRouter = Router();

ListingRouter.post("/listing",Authorization,createListingdata);
ListingRouter.get("/listingfiters",Authorization,getallfilters);
ListingRouter.get("/listing/:filterid",Authorization,getfilterdetails);
ListingRouter.patch("/listing/:filterid",Authorization,updatelistingdata);
ListingRouter.delete("/listing",Authorization,deletelistingfilter);


export default ListingRouter;