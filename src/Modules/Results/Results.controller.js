import LisitngMlsModel from "../Mlsdatarecorder/listing/Listing.model.js";
import ListingFilterModel from "../Criteria/Criteria-Listing/listing.model.js";
import usermodel from "../user/user.model.js";
import CriteriaLocationModel from "../Criteria/Criteria-Location/Criteria.model.js";
import adminmodel from "../admin/admin.model.js";
import criteriaScoringModel from "../Criteria/Criteria-Scoring/scoring.model.js"




const getdatafromlocation = async (Geometry, newskip, limit) => {
    if (!Geometry?.type || !Geometry?.coordinates) {
        console.error("Geometry is missing or invalid");
        return false;
    }

    let minLat, maxLat, minLng, maxLng;
    const delta = 0.05; // ≈ 5–6 km for Point/Line

    if (Geometry.type === "Polygon") {
        const points = Geometry.coordinates[0];
        // Math.min(...lats) ki jagah loop ya reduce use karein (Safe for large arrays)
        minLat = points[0][1];
        maxLat = points[0][1];
        minLng = points[0][0];
        maxLng = points[0][0];

        for (const [lng, lat] of points) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
        }
    } else {
        // For Point and LineString
        let lat, long;
        if (Geometry.type === "Point") {
            [long, lat] = Geometry.coordinates;
        } else if (Geometry.type === "LineString") {
            const midIndex = Math.floor(Geometry.coordinates.length / 2);
            [long, lat] = Geometry.coordinates[midIndex];
        }

        if (lat === undefined || long === undefined) return false;

        minLat = lat - delta;
        maxLat = lat + delta;
        minLng = long - delta;
        maxLng = long + delta;
    }

    const query = {
        Latitude: { $gte: minLat, $lte: maxLat },
        Longitude: { $gte: minLng, $lte: maxLng }
    };


    try {

        const [paginationresultdata, totalCount] = await Promise.all([
            LisitngMlsModel.find(query)
                .lean()
                .skip(Number(newskip))
                .limit(Number(limit)),
            LisitngMlsModel.countDocuments(query)
        ]);

        if (!paginationresultdata || paginationresultdata.length === 0) {
            return false;
        }

        return { paginationresultdata, overallpages: totalCount };
    } catch (error) {
        console.error("Database Error:", error);
        return false;
    }
};


const fetchListingWithPagination = async (platformuser, listing, skip, limit) => {
    const config = await ListingFilterModel.findOne({ userid: platformuser, filtername: listing }).lean();
    if (!config) return { data: [], total: 0 };

    const query = buildMongoQuery(config);
    const Model = LisitngMlsModel;


    const [data, total] = await Promise.all([
        Model.find(query).skip(skip).limit(limit).lean(),
        Model.countDocuments(query)
    ]);
    return { data, total };
};


const buildMongoQuery = (config) => {
    const query = {};

    // A. Boolean to Array Mapping ($in logic)
    const getStatusArray = (marketStatus) => {
        const statuses = [];
        if (marketStatus.active) statuses.push("Active");
        if (marketStatus.pending) statuses.push("Pending");
        if (marketStatus.sold) statuses.push("Closed");

        // Agar offMarket true hai, toh ye saare statuses add honge
        if (marketStatus.offMarket) {
            statuses.push("Hold", "Canceled", "Expired", "Withdrawn");
        }
        return statuses;
    };

    const propertyMap = { singleFamily: "Single Family Residence", condo: "Condominium", townhouse: "Townhouse", villa: "Villa" };
    const floorMap = { one: "One", two: "Two", threePlus: "Three Or More", multisplit: "Multi/Split" };
    const exteriorMap = { block: "Block", brick: "Brick", concrete: "Concrete", stone: "Stone", stucco: "Stucco", woodFrame: "Frame", woodSiding: "Wood Siding" };

    // Status Filter Application
    const StandardStatus1 = getStatusArray(config.marketStatus || {});
    if (StandardStatus1.length) query.StandardStatus = { $in: StandardStatus1 };

    // Helper for other boolean objects
    const mapValues = (obj, mapping) =>
        Object.keys(obj).filter(key => obj[key] === true).map(key => mapping[key]).filter(Boolean);

    const props = mapValues(config.propertyType || {}, propertyMap);
    const levels = mapValues(config.floorLevels || {}, floorMap);
    const materials = mapValues(config.exterior || {}, exteriorMap);

    if (props.length) query.PropertySubType = { $in: props };
    if (levels.length) query.Levels = { $in: levels };
    if (materials.length) query.ConstructionMaterials = { $in: materials };

    // B. Days Back Logic
    if (config.marketStatus?.daysBack) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - config.marketStatus.daysBack);
        // Standard field for date in MLS is usually ModificationTimestamp or StatusChangeTimestamp
        query.ModificationTimestamp = { $gte: dateLimit };
    }

    // C. Numeric Ranges (Min/Max)
    const rangeFields = {
        GarageSpaces: config.garages,
        CarportSpaces: config.carports,
        ListPrice: config.price,
        YearBuilt: config.year,
        LivingArea: config.gla,
        BedroomsTotal: config.beds,
        BathroomsTotalInteger: config.baths,
        LotSizeAcres: config.acreage
    };

    Object.entries(rangeFields).forEach(([dbField, val]) => {
        if (!val) return;
        const subQuery = {};
        if (val.min != null) subQuery.$gte = Number(val.min);
        if (val.max != null) subQuery.$lte = Number(val.max);
        if (Object.keys(subQuery).length) query[dbField] = subQuery;
    });

    // D. Private Pool
    if (config.privatePool === 'Yes') query.PoolPrivateYN = true;
    if (config.privatePool === 'No') query.PoolPrivateYN = false;

    // E. Keywords with Regex Optimization
    if (config.privateKeywords?.length) {
        query.PrivateRemarks = { $in: config.privateKeywords.map(k => new RegExp(k, 'i')) };
    }
    if (config.publicKeywords?.length) {
        query.PublicRemarks = { $in: config.publicKeywords.map(k => new RegExp(k, 'i')) };
    }

    return query;
};



const nowcalculatescore = async (listingdata, getscoringfilterdata) => {
    const privatekeywords = getscoringfilterdata.Privatekeywords || [];
    const Publickeywords = getscoringfilterdata.Publickeywords || [];
    const data = getscoringfilterdata.included || {};

    const results = await Promise.all(
        listingdata.map(async (item) => {

            // Each item gets its own variables
            let perpricescore = 0, DOMscore = 0, Vacantscore = 0;
            let PercentPriceChangescore = 0, PublicKeywordscore = 0;
            let Privatekeywordscore = 0, RealtorInfoscore = 0;
            let FinanceAvailablescore = 0;

            // PriceChanges
            if (data.PriceChanges?.enabled === "true") {
                const point = Number(data.PriceChanges.points);
                let score = 0;
                if (item.OriginalListPrice !== item.ListPrice) score++;
                if (item.PreviousListPrice && item.PreviousListPrice !== item.ListPrice) score++;
                perpricescore = score * point;
            }

            // DOM
            if (data.Dom?.enabled === "true") {
                const point = Number(data.Dom.points) || 0;
                const days = Number(item?.DaysOnMarket) || 0;
                DOMscore = point * days;
            }

            // Vacant
            if (data.Vacant?.enabled === "true") {
                const point = Number(data.Vacant.points || 0);
                const isVacant = item?.OccupantType === "Vacant";
                Vacantscore = point * (isVacant ? 1 : 0);
            }

            // PercentPriceChange
            if (data.PercentPriceChange?.enabled === "true") {
                const point = Number(data.PercentPriceChange.points);
                const originalPrice = Number(item?.OriginalListPrice);
                const currentPrice = Number(item?.ListPrice);

                if (originalPrice && currentPrice) {
                    const percentChange =
                        ((currentPrice - originalPrice) / originalPrice) * 100;
                    PercentPriceChangescore = point * percentChange;
                }
            }

            // Public Keywords
            if (data.PublicKeyword?.enabled === "true") {
                const point = Number(data.PublicKeyword.points);
                const remarks = (item.PublicRemarks || "").toLowerCase();
                let score = 0;
                Publickeywords.forEach(k => {
                    if (remarks.includes(k.toLowerCase())) score++;
                });
                PublicKeywordscore = score * point;
            }

            // Private Keywords
            if (data.Privatekeyword?.enabled === "true") {
                const point = Number(data.Privatekeyword.points);
                const remarks = (item.PrivateRemarks || "").toLowerCase();
                let score = 0;
                privatekeywords.forEach(k => {
                    if (remarks.includes(k.toLowerCase())) score++;
                });
                Privatekeywordscore = score * point;
            }

            // Realtor Info
            if (data.RealtorInfo?.enabled === "true") {
                const point = Number(data.RealtorInfo.points);
                const info = (item?.MFR_RealtorInfo || "").toLowerCase();
                const opts = data.RealtorInfo.options || [];

                let score = 0;
                opts.forEach(o => {
                    if (info.includes(o.toLowerCase())) score++;
                });

                RealtorInfoscore = point * score;
            }

            // Finance Available
            if (data.FinanceAvailable?.enabled === "true") {
                const point = Number(data.FinanceAvailable.points);
                const listingTerms = item?.ListingTerms || [];
                const neededTerms = data.FinanceAvailable.options || [];

                const matches = neededTerms.filter(opt =>
                    listingTerms.some(t =>
                        t.toLowerCase() === opt.toLowerCase()
                    )
                );

                FinanceAvailablescore = matches.length * point;
            }

            const Mlsscore = Math.ceil(perpricescore + DOMscore + Vacantscore +
                PercentPriceChangescore + PublicKeywordscore +
                Privatekeywordscore + RealtorInfoscore + FinanceAvailablescore);
           
            return {
                ...item,
                Score: Mlsscore
            };
        })
    );

    return results;
}


// Optimised Result Code :-

export const getresultvalue = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }
        const { listing, location, scoring, skip, limit } = req.query;
        const newskip = (skip - 1) * limit
 
        

        let getscoringfilterdata;

        if (scoring) {
            getscoringfilterdata = await criteriaScoringModel.findOne({
                userid: platformuser,
                filtername: scoring
            });
        }



        if (listing && location) {

            // find location filter from db
            const findlocationfiltername = await CriteriaLocationModel.findOne({ userid: platformuser, filtername: location }).lean();
            if (!findlocationfiltername && !findlocationfiltername.geometry) {
                return res.status(404).json({ "status": 404, "success": false, "message": "not filter found" });
            }
            //    find listing filter from db
            const config = await ListingFilterModel.findOne({ userid: platformuser, filtername: listing }).lean();
            if (!config) {
                return res.status(404).json({ "status": 404, "success": false, "message": "Resource not found" })
            }
            let query = buildMongoQuery(config);
            const Geometry = findlocationfiltername?.geometry;

            if (!Geometry?.type || !Geometry?.coordinates) {
                return res.status(404).json({ "status": 404, "success": false, "message": "Resource not found" })
            }

            let minLat, maxLat, minLng, maxLng;
            const delta = 0.05; // ≈ 5–6 km for Point/Line

            if (Geometry.type === "Polygon") {
                const points = Geometry.coordinates[0];
                // Math.min(...lats) 
                minLat = points[0][1];
                maxLat = points[0][1];
                minLng = points[0][0];
                maxLng = points[0][0];

                for (const [lng, lat] of points) {
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                    if (lng < minLng) minLng = lng;
                    if (lng > maxLng) maxLng = lng;
                }
            } else {
                let lat, long;
                if (Geometry.type === "Point") {
                    [long, lat] = Geometry.coordinates;
                } else if (Geometry.type === "LineString") {
                    const midIndex = Math.floor(Geometry.coordinates.length / 2);
                    [long, lat] = Geometry.coordinates[midIndex];
                }

                if (lat === undefined || long === undefined) return false;

                minLat = lat - delta;
                maxLat = lat + delta;
                minLng = long - delta;
                maxLng = long + delta;
            }


            query.Latitude = { $gte: minLat, $lte: maxLat },
                query.Longitude = { $gte: minLng, $lte: maxLng }


            const [totalpages, getresults] = await Promise.all([
                LisitngMlsModel.countDocuments(query),
                LisitngMlsModel.find(query, {}).limit(limit).skip(newskip).lean(),
            ])


            if (scoring) {

                const scoringscore = await nowcalculatescore(getresults, getscoringfilterdata);

                return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages, getresults: scoringscore } });

            }


            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages, getresults } });

        }
        else if (listing) {

            const { data, total } = await fetchListingWithPagination(
                platformuser,
                listing,
                newskip,
                limit
            );

            if (total === 0) {
                return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
            }

            if (scoring) {

                const scoringscore = await nowcalculatescore(data, getscoringfilterdata);
                return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages: total, getresults: scoringscore } });

            }



            return res.status(200).json({
                status: 200,
                success: true,
                message: "Request successful",
                data: {
                    getresults: data,
                    totalpages: total
                }
            });
        }

        else if (location) {


            const findlocationfiltername = await CriteriaLocationModel.findOne({ userid: platformuser, filtername: location }).lean();
            if (!findlocationfiltername && !findlocationfiltername.geometry) {
                return res.status(404).json({ "status": 404, "success": false, "message": "not filter found" });
            }
            const data = await getdatafromlocation(findlocationfiltername?.geometry, newskip, limit)
            if (!data || data.length === 0) {
                return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
            }


            const { paginationresultdata, overallpages } = data;

            if (overallpages === 0) {
                return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
            }



            if (scoring) {
                const scoringscore = await nowcalculatescore(paginationresultdata, getscoringfilterdata);
                return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages: overallpages, getresults: scoringscore } });
            }

            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages: overallpages, getresults: paginationresultdata } });

        }

        else {

            const [totalpages, getresults] = await Promise.all([
                LisitngMlsModel.countDocuments(),
                LisitngMlsModel.find({}, {}).limit(limit).skip(newskip).lean(),
            ])

            if (totalpages === 0) {
                return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
            }

            if (scoring) {
                const scoringscore = await nowcalculatescore(getresults, getscoringfilterdata);
                return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages, getresults: scoringscore } });
            }
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": { totalpages, getresults } });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}




export const testingresultspage = async (req, res) => {
    try {
       
        const alldata = await LisitngMlsModel.find();
       return res.json(alldata[0]);

        const allresults = await LisitngMlsModel.find({

            StandardStatus: { '$in': ['Closed'] },
            Latitude: { '$gte': 28.744363, '$lte': 29.046534 },
            Longitude: { '$gte': -82.00058, '$lte': -81.507568 }

        }, {
            //  ListingId:true,
            // PoolPrivateYN: true,
            // StandardStatus: true,
            // GarageSpaces: true,
            // GarageYN: true,
            // CarportYN: true,
            // CarportSpaces: true,
            // PublicRemarks: true,
            // DaysOnMarket: true,
            // YearBuilt: true,
            // Latitude: true,
            // Longitude:true,
            // BedroomsTotal: true,
            // BathroomsTotalInteger: true,
            // LivingArea: true,
            // LotSizeSquareFeet:true,
            // LotSizeAcres: true,
            // CountyOrParish: true
        }).limit();
        return res.status(200).json(allresults)

        //     const deletesomemls = await LisitngMlsModel.find().limit(30000);
        //    const getImages = deletesomemls.map((item)=> item._id);

        //    await LisitngMlsModel.deleteMany({_id:{$in:getImages}});
        //    res.send("deleted")

    } catch (error) {
        console.log(error)
        return res.status(500).send("internal errro");
    }
}



