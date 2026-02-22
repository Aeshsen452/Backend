import express from "express";
import cors from "cors";
import env from "dotenv";
import connectdb from "./src/config/db.config.js";
import path from "path";

// Modules Routes
import adminRouter from "./src/Modules/admin/admin.routes.js";
import otpRouter from "./src/Modules/ReusableModule/otp/otp.routes.js";
import updateRouter from "./src/Modules/ReusableModule/updateProfile/update.routes.js";
import changepassRouter from "./src/Modules/ReusableModule/changepassword/changepassword.routes.js";
import userRouter from "./src/Modules/user/user.routes.js";
import ListingRouter from "./src/Modules/Criteria/Criteria-Listing/listing.routes.js";
import ScoringRouter from "./src/Modules/Criteria/Criteria-Scoring/scoring.routes.js";
import MatchToleranceRouter from "./src/Modules/Criteria/Analysis/MatchTolerance/matchtolerance.routes.js";
import comparableAjustmentRouter from "./src/Modules/Criteria/Analysis/Comparable Adjustments/comparable.routes.js";
import comparableRankRouter from "./src/Modules/Criteria/Analysis/Comparable Rank/Comparablerank.routes.js";
import LocationRouter from "./src/Modules/Criteria/Criteria-Location/Criteria.routes.js";




import LisitngMlsRouter from "./src/Modules/Mlsdatarecorder/listing/Listing.routes.js";
import ResultRouter from "./src/Modules/Results/Results.routes.js";
import { startCronJob,initalStart } from "./src/Modules/Mlsdatarecorder/listing/Listing.controller.js";
import FavouriteRouter from "./src/Modules/Favourite/Favourite.routes.js";
import AnalysisRouter from "./src/Modules/Analysis/Analysis.routes.js";
import offerRouter from "./src/Modules/Offers/offer.routes.js";
import ShowimagesRouter from "./src/Modules/MlsImagessaver/Images.routes.js";
import DeadRouter from "./src/Modules/Dead/dead.routes.js";

import compSearchRouter from "./src/Modules/compSearch/compSearch.routes.js";



env.config();
connectdb();

startCronJob();
// initalStart()


const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extends: true }));

app.use("/images", express.static(path.join(process.cwd(), "/public/images")));
app.use("/mlsimages", express.static(path.join(process.cwd(), "/MLSImages")))

app.use("/api", adminRouter, otpRouter, updateRouter, changepassRouter
    , userRouter, ListingRouter, ScoringRouter, MatchToleranceRouter
    , comparableAjustmentRouter,
    comparableRankRouter, LisitngMlsRouter, ResultRouter, FavouriteRouter, AnalysisRouter,
    offerRouter, ShowimagesRouter, DeadRouter, LocationRouter, compSearchRouter
);



app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
})



