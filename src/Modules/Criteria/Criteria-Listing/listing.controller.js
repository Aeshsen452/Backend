import ListingFilterModel from "./listing.model.js";
import usermodel from "../../user/user.model.js";
import adminmodel from "../../admin/admin.model.js";

export const createListingdata = async (req, res) => {
    try {
        const platformuser = req.user?._id;
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const data = req.body;
       
        const {privateKeywords,publicKeywords,privatePool} = req.body
          
        if (!data) {
            return res.status(403).json({ status: 403, success: false, message: "Forbidden" });
        }

        const verifyuser =
            await usermodel.findById(platformuser) ||
            await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const PlatformuserType = verifyuser.platformuser;

        const marketStatus = {};
        const propertyType = {};
        const floorLevels = {};
        const garages = {};
        const carports = {};
        const exterior = {};

        const {
            marketStatus: dataMarketstatus = [],
            marketStatusdaysback: daysback,
            propertyType: datapropertyType = [],
            floorLevels: datafloorLevels = [],
            exteriorConstruction: dataexteriorConstruction = [],
            filters: datafilters = {},
            prices: dataprices = {},
            filtername: filternameInput = "filter"

        } = data;

        // marketStatus
        if (Array.isArray(dataMarketstatus)) {
            if (dataMarketstatus.includes("Sold")) marketStatus.sold = true;
            if (dataMarketstatus.includes("Active")) marketStatus.active = true;
            if (dataMarketstatus.includes("Pending")) marketStatus.pending = true;
            if (dataMarketstatus.includes("Off Market")) marketStatus.offMarket = true;
        }

        if (daysback) marketStatus.daysBack = Number(daysback);

        // propertyType
        if (Array.isArray(datapropertyType)) {
            if (datapropertyType.includes("Single Family Residential")) propertyType.singleFamily = true;
            if (datapropertyType.includes("Condominium")) propertyType.condo = true;
            if (datapropertyType.includes("Townhouse")) propertyType.townhouse = true;
            if (datapropertyType.includes("Villa")) propertyType.villa = true;
        }

        // floorLevels (fixed incorrect mappings)
        if (Array.isArray(datafloorLevels)) {
            if (datafloorLevels.includes("MultiSplit +")) floorLevels.multisplit = true;
            if (datafloorLevels.includes("One")) floorLevels.one = true;
            if (datafloorLevels.includes("Two")) floorLevels.two = true;
            if (datafloorLevels.includes("Three +")) floorLevels.threePlus = true;
        }

        // exteriorConstruction
        if (Array.isArray(dataexteriorConstruction)) {
            if (dataexteriorConstruction.includes("Block")) exterior.block = true;
            if (dataexteriorConstruction.includes("Brick")) exterior.brick = true;
            if (dataexteriorConstruction.includes("Concrete")) exterior.concrete = true;
            if (dataexteriorConstruction.includes("Stone")) exterior.stone = true;
            if (dataexteriorConstruction.includes("Stucco")) exterior.stucco = true;
            if (dataexteriorConstruction.includes("Wood Frame")) exterior.woodFrame = true;
            if (dataexteriorConstruction.includes("Wood Siding")) exterior.woodSiding = true;
        }

        // filters
        Object.keys(datafilters).forEach(key => {
            datafilters[key].min = datafilters[key]?.min ? Number(datafilters[key].min) : null;
            datafilters[key].max = datafilters[key]?.max ? Number(datafilters[key].max) : null;
        });

        // prices
        if (dataprices.Carports) {
            carports.min = dataprices.Carports.min ? Number(dataprices.Carports.min) : null;
            carports.max = dataprices.Carports.max ? Number(dataprices.Carports.max) : null;
        }

        if (dataprices.Garages) {
            garages.min = dataprices.Garages.min ? Number(dataprices.Garages.min) : null;
            garages.max = dataprices.Garages.max ? Number(dataprices.Garages.max) : null;
        }

        // Generate filtername
        let newfiltername;

        if (filternameInput === "default") {
            const exists = await ListingFilterModel.findOne({
                userid: platformuser,
                filtername: "default"
            });
            if (exists) {
                return res.status(409).json({
                    status: 409,
                    success: false,
                    message: "Default filter already exists"
                });
            }
           
        }
        //  else if(filternameInput==="Filter Custom") {
        //     const filterBase = "filter";

        //     const existing = await ListingFilterModel.find({
        //         userid: platformuser,
        //         filtername: { $regex: `^${filterBase}(\\d+)?$` }
        //     });

        //     if (!existing.length) {
        //         newfiltername = filterBase;
        //     } else {
        //         const nums = existing
        //             .map(f => f.filtername)
        //             .map(name => parseInt(name.replace("filter", "")) || 0);

        //         newfiltername = `${filterBase}${Math.max(...nums) + 1}`;
        //     }
        // } else{
        //    newfiltername = filternameInput;
        // }

         const checkexistingfiltername = await ListingFilterModel.findOne({ filtername: filternameInput, userid: platformuser });
                 if (checkexistingfiltername) {
                        return res.status(409).json({ "status": 409, "success": false, "message": "filtername is  already used" });
                    }

        const createlisting = new ListingFilterModel({
            marketStatus,
            propertyType,
            floorLevels,
            garages,
            carports,
            exterior,
            price: datafilters.price,
            year: datafilters.year,
            gla: datafilters.gla,
            beds: datafilters.beds,
            baths: datafilters.baths,
            acreage: datafilters.acreage,
            userid: platformuser,
            PlatformuserType,
            filtername: filternameInput,
            privateKeywords:privateKeywords,
            publicKeywords:publicKeywords,
            privatePool,
        });

        await createlisting.save();

        return res.status(201).json({
            success: true,
            message: "Filter created successfully",
            filtername: newfiltername
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
};


export const getallfilters = async (req,res) =>{
    try {
         const platformuser = req.user?._id;
         
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser =await usermodel.findById(platformuser) ||await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

       const getallfilter = await ListingFilterModel.find({userid:platformuser},{filtername:true,filterpagepath:true}).sort({_id:1});
       if(getallfilter.length ===0){
        return res.json(204).json({ "status": 204, "success": true, "message": "No filter found" });
       }

       res.status(200).json(getallfilter);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}


export const getfilterdetails = async(req,res) =>{
    try {
        const platformuser = req.user?._id;
         
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser =await usermodel.findById(platformuser) ||await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const {filterid} = req.params;
        if(!filterid){
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }

        const verifyfilterid = await ListingFilterModel.findById(filterid);
        console.log(verifyfilterid)
        if(!verifyfilterid){
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }
        res.status(200).json({"status": 200, "success": true, "message": "Request successful", "data":verifyfilterid})

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const updatelistingdata = async(req,res) =>{
    try {
        const platformuser = req.user?._id;
         
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser =await usermodel.findById(platformuser) ||await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const {filterid} = req.params;
        if(!filterid){
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }
        const data = req.body;
        if(!data){
            return res.status(403).json({"status": 403, "success": false, "message": "Atleast need one data to update" })
        }

        const verifyfilterid = await ListingFilterModel.findById(filterid);
        if(!verifyfilterid){
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }

        const updatelisting = await ListingFilterModel.findByIdAndUpdate(filterid,data,{new:true});
        return res.status(201).json({ "status": 201, "success": true, "message": "filter update successfully"});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const deletelistingfilter = async(req,res)=>{
    try {
        const platformuser = req.user?._id;
         
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser =await usermodel.findById(platformuser) ||await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const {filterid} = req.body;
        if(filterid.length===0){
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }

        await ListingFilterModel.deleteMany({ _id: { $in: filterid } });
        return res.status(200).json({ "status": 200, "success": true, "message": "filter deleted successfully"});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}
































































































// export const createListingdata = async (req, res) => {
//     try {
//         const platformuser = req.user?._id;

//         if (!platformuser) {
//             return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
//         }
//         const data = req.body
//         if (!data) {
//             return res.status(403).json({ "status": 403, "success": false, "message": "Forbidden" })
//         }
//         const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);
//         if (!verifyuser) {
//             return res.status(403).json({ status: 403, success: false, message: "User not found" });
//         }
//         const PlatformuserType = verifyuser.platformuser
//         const marketStatus = {};
//         const propertyType = {};
//         const floorLevels = {};
//         const garages = {};
//         const carports = {};
//         const exterior = {};

//         const daysback = data.marketStatusdaysback
//         const dataMarketstatus = data.marketStatus
//         const datapropertyType = data.propertyType
//         const datafloorLevels = data.floorLevels
//         const dataexteriorConstruction = data.exteriorConstruction
//         const datafilters = data.filters
//         const dataprices = data.prices;

//         if (dataMarketstatus.length !== 0) {
//             if (dataMarketstatus.includes("Sold")) {
//                 marketStatus.sold = true
//             }

//             if (dataMarketstatus.includes("Active")) {
//                 marketStatus.active = true
//             }
//             if (dataMarketstatus.includes("Pending")) {
//                 marketStatus.pending = true
//             }
//             if (dataMarketstatus.includes("Off Market")) {
//                 marketStatus.offMarket = true
//             }
//         }
//         if (daysback) {
//             marketStatus.daysBack = Number(daysback);
//         }
//         if (datapropertyType.length !== 0) {
//             if (datapropertyType.includes("Single Family Residential")) {
//                 propertyType.singleFamily = true
//             }
//             if (datapropertyType.includes("Condominium")) {
//                 propertyType.condo = true
//             }
//             if (datapropertyType.includes("Townhouse")) {
//                 propertyType.townhouse = true
//             }
//             if (datapropertyType.includes("Villa")) {
//                 propertyType.villa = true
//             }

//         }

//         if (datafloorLevels !== 0) {
//             if (datafloorLevels.includes("MultiSplit +")) {
//                 floorLevels.multisplit = true
//             }
//             if (datafloorLevels.includes("Three +")) {
//                 floorLevels.one = true
//             }
//             if (datafloorLevels.includes("Two")) {
//                 floorLevels.two = true
//             }
//             if (datafloorLevels.includes("One")) {
//                 floorLevels.threePlus = true
//             }
//         }

//         if (dataexteriorConstruction !== 0) {
//             if (dataexteriorConstruction.includes("Block")) {
//                 exterior.block = true
//             }
//             if (dataexteriorConstruction.includes("Brick")) {
//                 exterior.brick = true
//             }
//             if (dataexteriorConstruction.includes("Concrete")) {
//                 exterior.concrete = true
//             }
//             if (dataexteriorConstruction.includes("Stone")) {
//                 exterior.stone = true
//             }
//             if (dataexteriorConstruction.includes("Stucco")) {
//                 exterior.stucco = true
//             }
//             if (dataexteriorConstruction.includes("Wood Frame")) {
//                 exterior.woodFrame = true
//             }
//             if (dataexteriorConstruction.includes("Wood Siding")) {
//                 exterior.woodSiding = true
//             }
//         }

//         if (datafilters) {
//             Object.keys(datafilters).forEach(key => {
//                 datafilters[key].min = datafilters[key].min ? Number(datafilters[key].min) : null;
//                 datafilters[key].max = datafilters[key].max ? Number(datafilters[key].max) : null;
//             });
//         }

//         if (dataprices) {
//             if (dataprices.Carports) {
//                 carports.min = dataprices.Carports.min ? Number(dataprices.Carports.min) : null,
//                     carports.max = dataprices.Carports.max ? Number(dataprices.Carports.max) : null
//             }

//             if (dataprices.Garages) {
//                 garages.min = dataprices.Garages.min ? Number(dataprices.Garages.min) : null,
//                     garages.max = dataprices.Garages.max ? Number(dataprices.Garages.max) : null
//             }

//         }

//            const filternameInput = data.filtername || "filter";
//            let newfiltername;
           
//            // Default filter logic
//            if (filternameInput === "default") {
//                const existingDefault = await ListingFilterModel.findOne({ userid, filtername: "default" });
//                if (existingDefault) {
//                    return res.status(409).json({ status: 409, success: false, message: "Default filter already exists" });
//                }
//                newfiltername = "default";
//            } else {
//                const filterBase = "filter";
           
//                const existingCustoms = await ListingFilterModel.find({
//                    userid,
//                    filtername: { $regex: `^${filterBase}(\\d+)?$` }
//                });
           
//                if (!existingCustoms.length) {
//                    newfiltername = filterBase; // first custom filter
//                } else {
//                    // Extract numeric suffix and find max
//                    const suffixNumbers = existingCustoms
//                        .map(f => f.filtername)
//                        .map(name => {
//                            const match = name.match(/(\d+)$/);
//                            return match ? parseInt(match[1]) : 0;
//                        });
           
//                    const maxSuffix = Math.max(...suffixNumbers);
//                    newfiltername = `${filterBase}${maxSuffix + 1}`;
//                }
//            }


//         const createlisting = new ListingFilterModel({
//             marketStatus, propertyType, floorLevels, garages, carports, exterior
//             , price: datafilters.price,
//             year: datafilters.year,
//             gla: datafilters.gla,
//             beds: datafilters.beds,
//             baths: datafilters.baths,
//             acreage: datafilters.acreage,
//             userid: platformuser,
//             PlatformuserType,
//             filtername :newfiltername

//         });
//         await createlisting.save()
//         res.status(201).json("data getting successfully")

//     } catch (error) {
//         console.log(error)
//     }
// }