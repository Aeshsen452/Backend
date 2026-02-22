import matchtolerancemodel from "../Criteria/Analysis/MatchTolerance/matchtolerance.model.js";
import comparableRankmodel from "../Criteria/Analysis/Comparable Rank/Comparablerank.model.js";
import adminmodel from "../admin/admin.model.js";
import usermodel from "../user/user.model.js";
import LisitngMlsModel from "../Mlsdatarecorder/listing/Listing.model.js";
import mlsimagesmodel from "../MlsImagessaver/Images.model.js";
import compSearchmodel from "./compselected.model.js";



const buildQuery = async (verifyMatchId, verifyanalysisDataid) => {

    const { Longitude, Latitude, YearBuilt,
        BedroomsTotal,
        BathroomsTotalInteger,
        LivingArea,
        LotSizeAcres, } = verifyanalysisDataid

    if (!Longitude || !Latitude) {
        return { "status": 400, "success": false, "message": "Center Codinates Required" }
    }

    const radius = Number(verifyMatchId?.milesaway?.rangebar);
    if (radius < 0 || radius > 10) {
        return { "status": 400, "success": false, "message": "radius must be under 10 miles and not be in negative" }
    }


    const centerLat = parseFloat(Latitude);
    const centerLon = parseFloat(Longitude);
    const mileRadius = parseFloat(radius) || 5;


    const latDelta = mileRadius / 69;
    const lonDelta = mileRadius / (69 * Math.cos(centerLat * (Math.PI / 180)));


    const status = [];
    if (verifyMatchId.milesaway.sold) status.push("Closed");
    if (verifyMatchId.milesaway.active) status.push("Active");
    if (verifyMatchId.milesaway.pending) status.push("Pending");
    if (verifyMatchId.milesaway.offmarket) status.push("Hold", "Canceled", "Expired", "Withdrawn");


    const dom = Number(verifyMatchId.milesaway.daysback);

    let query = {
        Latitude: {
            $gte: centerLat - latDelta,
            $lte: centerLat + latDelta
        },
        Longitude: {
            $gte: centerLon - lonDelta,
            $lte: centerLon + lonDelta
        }
    };

    if (status.length > 0) {
        query.StandardStatus = { $in: status };
    }

    if (dom && dom > 0) {
        query.DaysOnMarket = { $lte: dom };
    }

    if (verifyMatchId.privatepools === "Yes") {
        query.PoolPrivateYN = true;
    } else if (verifyMatchId.privatepools === "No") {
        query.PoolPrivateYN = false;
    }


    const garageMin = verifyMatchId.garages.min
    const garageMax = verifyMatchId?.garages?.max

    if (garageMin >= 0 && garageMax > 0) {
        query.GarageSpaces = {
            $gte: garageMin, $lte: garageMax
        }
    }


    const carportsMin = verifyMatchId.carports.min
    const carportsMax = verifyMatchId?.carports?.max

    if (carportsMin >= 0 && carportsMax > 0) {
        query.CarportSpaces = {
            $gte: carportsMin, $lte: carportsMax
        }
    }



    const myWords = verifyMatchId.publickeywords;

    if (myWords.length !== 0) {
        const queryConditions = myWords.map(word => ({
            PublicRemarks: { $regex: word, $options: 'i' }
        }));
        query.$or = queryConditions;
    }

    const { yearbuilt, gla, acreage, beds, baths } = verifyMatchId.any;


    if (yearbuilt.enabled) {
        const points = yearbuilt.points
        if (points > 10 || points < 0) {
            return { "status": 400, "success": false, "message": "invalid points range in yearbuilt" }
        }
        if (YearBuilt) {
            query.YearBuilt = {
                $gte: (Number(YearBuilt) - Number(points)), $lte: (Number(YearBuilt) + Number(points))
            }

        }

    }

    if (gla.enabled) {
        const points = gla.points
        if (points > 100 || points < 0) {
            return { "status": 400, "success": false, "message": "invalid points range in gla" }
        }

        if (LivingArea) {
            query.LivingArea = {
                $gte: LivingArea - Number(points), $lte: LivingArea + Number(points)
            }

        }
    }

    if (acreage.enabled) {
        const points = acreage.points
        if (points > 100 || points < 0) {
            return { "status": 400, "success": false, "message": "invalid points range in acreage" }
        }
        if (LotSizeAcres) {
            const LowerBound = LotSizeAcres - (LotSizeAcres * Number(points) / 100)
            const UpperBound = LotSizeAcres + (LotSizeAcres * Number(points) / 100)

            query.LotSizeAcres = {
                $gte: LowerBound, $lte: UpperBound
            }

        }
    }

    if (beds.enabled) {
        const points = beds.points
        if (points > 10 || points < 0) {
            return { "status": 400, "success": false, "message": "invalid points range in beds" }
        }
        if (BedroomsTotal) {
            query.BedroomsTotal = {
                $gte: BedroomsTotal - Number(points), $lte: BedroomsTotal + Number(points)
            }

        }
    }
    
    if (baths.enabled) {
        const points = baths.points
        if (points > 10 || points < 0) {
            return { "status": 400, "success": false, "message": "invalid points range in baths" }
        }
        if (BathroomsTotalInteger) {
            query.BathroomsTotalInteger = {
                $gte: BathroomsTotalInteger - Number(points), $lte: BathroomsTotalInteger + Number(points)
            }

        }
    }

    return { "success": true, query }

}

const calculateRankScore = (filterdata, verifyrandId) => {
    const { yearbuilt, gla, acreage, beds, baths, distance } = verifyrandId.weight1;
    const { garages, carports, privatepool, solddate, levels, homestyle } = verifyrandId.weight2;


    const allproperty = filterdata.map((item) => {
        let Score = 0;

        if (distance) {
            Score += filterdata.length * distance
        }

        if (item.LivingArea && gla) {
            Score += item.LivingArea * gla
        }

        if (item.YearBuilt && yearbuilt) {
            Score += item.YearBuilt * yearbuilt
        }

        if (item.BedroomsTotal && beds) {
            Score += item.BedroomsTotal * beds
        }


        if (item.BathroomsTotalInteger && baths) {
            Score += item.BathroomsTotalInteger * baths
        }


        if (item.LotSizeAcres && acreage) {
            Score += item.LotSizeAcres * acreage
        }


        if (item.GarageSpaces && garages) {
            Score += item.GarageSpaces * garages
        }


        if (item.CarportSpaces && carports) {
            Score += item.CarportSpaces * carports
        }

        if (item.Levels && levels) {
            Score += item.Levels.length * levels
        }

        if (item.PoolPrivateYN && privatepool) {
            Score += privatepool
        }

        if (item.DaysOnMarket && solddate) {
            Score += item.DaysOnMarket * solddate
        }

        return {
            ...item,
            Score
        }

    })

    return allproperty

}

export const populateCompSearchData = async (req, res) => {

    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }



        const { matchId, randId, analysisDataid } = req.query;

        if (!analysisDataid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Bad request" })
        }


        const verifyanalysisDataid = await LisitngMlsModel.findById(analysisDataid);

        if (!verifyanalysisDataid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Bad request" })
        }

        const verifyMatchId = await matchtolerancemodel.findById(matchId);
        if (!verifyMatchId) {
            return { "status": 204, "success": true, "message": "No content With This Id" };
        }



        if (matchId) {

            const result = await buildQuery(verifyMatchId, verifyanalysisDataid);
            if (!result.success) {
                return res.status(result.status).json(result);
            }



            const filterdata = await LisitngMlsModel.find(result.query, {
                // DaysOnMarket: true,
                // PublicRemarks: true,
                // PoolPrivateYN: true,
                // GarageSpaces: true,
                // CarportSpaces: true,
                // YearBuilt: true,
                // LivingArea: true,
                // LotSizeAcres: true,
                // BedroomsTotal: true,
                // BathroomsTotalInteger: true,
                // StandardStatus: true,
                // Levels: true
            });

            if (filterdata.length === 0) {
                return res.status(204).json({ "status": 204, "success": true, "message": "No content" });
            }
            const dataWithImages = await Promise.all(filterdata.map(async (item) => {
                const id = item._id;
                let existing = false
                const getImages = await mlsimagesmodel.findOne({ mlslsitingid: id });
                const checkexists = await compSearchmodel.findOne({ userid: verifyuser._id, CompResults: id });

                if (checkexists) {
                    existing = true
                }

                return {
                    ...item.toObject(),
                    imagePath: getImages
                        ? `https://filtergoat-mls-image.s3.amazonaws.com/MLSImages/${getImages.imagepath}`
                        : null,
                    existing
                };
            }));


            if (randId) {
                const verifyrandId = await comparableRankmodel.findById(randId);
                if (!verifyrandId) {
                    return res.status(400).json({ "status": 400, "success": false, "message": "Bad request" })
                }


                const Rankresult = calculateRankScore(dataWithImages, verifyrandId);

                return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": Rankresult })


            }
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": dataWithImages })
        }

        return res.status(200).json({ "status": 200, "success": true, "message": "filter deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }

}

export const saveSearchComp = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const { CompResults } = req.body;
        if (!CompResults) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Bad request" })
        }

        const checkexists = await compSearchmodel.findOne({ userid: verifyuser._id, CompResults });

        if (checkexists) {
            await compSearchmodel.findByIdAndDelete(checkexists._id);

            return res.status(200).json({ hasexist: false })
        }

        const newcompdata = new compSearchmodel({
            Platformuser: verifyuser?.platformuser,
            userid: platformuser,
            CompResults
        })

        await newcompdata.save()

        res.status(200).json({ hasexist: true })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}