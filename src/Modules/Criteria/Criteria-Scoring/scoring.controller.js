// import usermodel from "../../user/user.model.js";
// import adminmodel from "../../admin/admin.model.js"
// import criteriaScoringModel from "./scoring.model.js";
// export const Scoringdata = async (req, res) => {
//     try {
//         const userid = req.user?._id;
//         if (!userid) {
//             return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
//         }

//         const verifyuser = await usermodel.findById(userid) || await adminmodel.findById(userid);
//         if (!verifyuser) {
//             return res.status(403).json({ "status": 403, "success": false, "message": "user not found" });
//         }

//         const data = req.body;


//         const Privatekeywords = data.privatesearch;
//         const Publickeywords = data.publicsearch;

//         const PriceChanges = {
//             enabled: data.toggles?.NoPricechanges,
//             points: data.fields?.NoPricechanges
//         };
//         const Dom = {
//             enabled: data.toggles?.DOM,
//             points: data.fields?.DOM
//         };

//         const Vacant = {
//             enabled: data.toggles?.Vacant,
//             points: data.fields?.Vacant
//         };

//         const PercentPriceChange = {
//             enabled: data.toggles?.perPriceChange,
//             points: data.fields?.perPriceChange
//         };

//         const PublicKeyword = {
//             enabled: data.toggles?.PublicKeywords,
//             points: data.fields?.PublicKeywords
//         };
//         const Privatekeyword = {
//             enabled: data.toggles?.PrivateKeywords,
//             points: data.fields?.PrivateKeywords
//         };
//         const RealtorInfo = {
//             enabled: data.toggles?.RealtorInformation,
//             points: data.fields?.RealtorInformation,
//             options: data.Realinfodata
//         };
//         const FinanceAvailable = {
//             enabled: data.toggles?.FinanceAvailable,
//             points: data.fields?.FinanceAvailable,
//             options: data.Financedata
//         };

//         const included = {
//             PriceChanges, Dom, Vacant, PercentPriceChange, PublicKeyword, Privatekeyword, RealtorInfo, FinanceAvailable
//         };
//         const Platformuser = verifyuser.platformuser;

//         const savedatainscoringmodel = new criteriaScoringModel ({

//             Platformuser, userid, included, Privatekeywords, Publickeywords
//         }
//         )

//         await savedatainscoringmodel.save();
//         res.status(201).json({ "status": 201, "success": true, "message": "Data added successfully" })

//     } catch (error) {
//         res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
//         console.log(error);
//     }
// }




import criteriaScoringModel from "./scoring.model.js";
import usermodel from "../../user/user.model.js";
import adminmodel from "../../admin/admin.model.js";

// export const Scoringdata = async (req, res) => {
//     try {
//         const userid = req.user?._id;
//         if (!userid) {
//             return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
//         }

//         const verifyuser = await usermodel.findById(userid) || await adminmodel.findById(userid);
//         if (!verifyuser) {
//             return res.status(403).json({ status: 403, success: false, message: "User not found" });
//         }

//         const data = req.body;

//         const PriceChanges = {
//             enabled: String(data.toggles?.NoPricechanges),
//             points: data.fields?.NoPricechanges
//         };
//         const Dom = {
//             enabled: String(data.toggles?.DOM),
//             points: data.fields?.DOM
//         };
//         const Vacant = {
//             enabled: String(data.toggles?.Vacant),
//             points: data.fields?.Vacant
//         };
//         const PercentPriceChange = {
//             enabled: String(data.toggles?.perPriceChange),
//             points: data.fields?.perPriceChange
//         };
//         const PublicKeyword = {
//             enabled: String(data.toggles?.PublicKeywords),
//             points: data.fields?.PublicKeywords
//         };
//         const Privatekeyword = {
//             enabled: String(data.toggles?.PrivateKeywords),
//             points: data.fields?.PrivateKeywords
//         };
//         const RealtorInfo = {
//             enabled: String(data.toggles?.RealtorInformation),
//             points: data.fields?.RealtorInformation,
//             options: data.Realinfodata || []
//         };
//         const FinanceAvailable = {
//             enabled: String(data.toggles?.FinanceAvailable),
//             points: data.fields?.FinanceAvailable,
//             options: data.Financedata || []
//         };

//         const included = {
//             PriceChanges, Dom, Vacant, PercentPriceChange, PublicKeyword, Privatekeyword, RealtorInfo, FinanceAvailable
//         };
//         const Platformuser = verifyuser.platformuser;

//          const filtername = data.filtername
//          let  filtercount =0;
//          let newfiltername =""

//          if(filtername === "default"){
//             newfiltername ="default"
//          }else{
//             newfiltername ="filter"
//          }

//          const checkfilter = await criteriaScoringModel.findOne({userid,filtername:"default"});

//          const checkcustomfilter = await criteriaScoringModel.find({userid, filtername: { $ne: "default" }});
//          if(checkfilter !==null){
//             return res.status(409).json({ "status": 409, "success": false, "message": "default already inserted" })
//          }
//          if(checkcustomfilter.length !==0){
//               const checkfiltername = checkcustomfilter.filter((item)=>item.filtername == filtername)
//               if(checkfiltername.length >0){
//               filtercount = checkfiltername.length;
//               newfiltername = `filter${filtercount}`
//               }

//          }



//         const savedatainscoringmodel = new criteriaScoringModel({
//             filtername:newfiltername,
//             Platformuser,
//             userid,
//             included,
//             Privatekeywords: data.privatesearch || [],
//             Publickeywords: data.publicsearch || []
//         });

//         await savedatainscoringmodel.save();

//         res.status(201).json({ status: 201, success: true, message: "Data added successfully" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ status: 500, success: false, message: "Internal server error" });
//     }
// };



// import usermodel from "../../user/user.model.js";
// import adminmodel from "../../admin/admin.model.js";
// import criteriaScoringModel from "../../models/scoring.model.js"; // adjust path as needed

export const Scoringdata = async (req, res) => {
    try {
        const userid = req.user?._id;
        if (!userid) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        // Verify user
        const verifyuser = await usermodel.findById(userid) || await adminmodel.findById(userid);
        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const data = req.body;
        const Platformuser = verifyuser.platformuser;

        // Prepare included object with string-enabled fields
        const included = {
            PriceChanges: {
                enabled: data.toggles?.NoPricechanges ? "true" : "false",
                points: data.fields?.NoPricechanges
            },
            Dom: {
                enabled: data.toggles?.DOM ? "true" : "false",
                points: data.fields?.DOM
            },
            Vacant: {
                enabled: data.toggles?.Vacant ? "true" : "false",
                points: data.fields?.Vacant
            },
            PercentPriceChange: {
                enabled: data.toggles?.perPriceChange ? "true" : "false",
                points: data.fields?.perPriceChange
            },
            PublicKeyword: {
                enabled: data.toggles?.PublicKeywords ? "true" : "false",
                points: data.fields?.PublicKeywords
            },
            Privatekeyword: {
                enabled: data.toggles?.PrivateKeywords ? "true" : "false",
                points: data.fields?.PrivateKeywords
            },
            RealtorInfo: {
                enabled: data.toggles?.RealtorInformation ? "true" : "false",
                points: data.fields?.RealtorInformation,
                options: data.Realinfodata || []
            },
            FinanceAvailable: {
                enabled: data.toggles?.FinanceAvailable ? "true" : "false",
                points: data.fields?.FinanceAvailable,
                options: data.Financedata || []
            }
        };

     
        // let newfiltername = filternameInput === "default" ? "default" : "filter";

        // // Check if default filter already exists
        // if (newfiltername === "default") {
        //     const existingDefault = await criteriaScoringModel.findOne({ userid, filtername: "default" });
        //     if (existingDefault) {
        //         return res.status(409).json({ status: 409, success: false, message: "Default filter already inserted" });
        //     }
        // } else {
        //     // Check custom filters
        //     const checkcustomfilter = await criteriaScoringModel.find({ userid, filtername: { $ne: "default" } });
        //     if (checkcustomfilter.length > 0) {
        //         const sameNameFilters = checkcustomfilter.filter(item => item.filtername === filternameInput);
        //         if (sameNameFilters.length > 0) {
        //             newfiltername = `${filternameInput}${checkcustomfilter.length}`;
        //         }
        //     }
        // }

        // Handle filtername logic
        const filternameInput = data.filtername;

        if (filternameInput === "default") {
            const existingDefault = await criteriaScoringModel.findOne({ userid, filtername: "default" });
            if (existingDefault) {
                return res.status(409).json({ status: 409, success: false, message: "Default filter already exists" });
            }

        }

        const checkexistingfiltername = await criteriaScoringModel.findOne({ filtername: filternameInput, userid: userid });
        if (checkexistingfiltername) {
            return res.status(409).json({ "status": 409, "success": false, "message": "filtername is  already used" });
        }

        // Create and save new scoring document
        const savedScoring = new criteriaScoringModel({
            filtername: filternameInput,
            Platformuser,
            userid,
            included,
            Privatekeywords: data.privatesearch || [],
            Publickeywords: data.publicsearch || []
        });

        await savedScoring.save();

        res.status(201).json({ status: 201, success: true, message: "Data added successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, success: false, message: "Internal server error" });
    }
};


export const getallfilters = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const getallfilter = await criteriaScoringModel.find({ userid: platformuser }, { filtername: true, filterpagepath: true }).sort({ filtername: 1 });
        if (getallfilter.length === 0) {
            return res.json(204).json({ "status": 204, "success": true, "message": "No filter found" });
        }

        res.status(200).json(getallfilter);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}


export const getfilterdetails = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const { filterid } = req.params;
        if (!filterid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }

        const verifyfilterid = await criteriaScoringModel.findById(filterid);
        if (!verifyfilterid) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": verifyfilterid })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const updatelistingdata = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const { filterid } = req.params;
        if (!filterid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }
        const data = req.body;
        if (!data) {
            return res.status(403).json({ "status": 403, "success": false, "message": "Atleast need one data to update" })
        }

        const verifyfilterid = await criteriaScoringModel.findById(filterid);
        if (!verifyfilterid) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }

        const updatelisting = await criteriaScoringModel.findByIdAndUpdate(filterid, data, { new: true });
        return res.status(201).json({ "status": 201, "success": true, "message": "filter update successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const deletelistingfilter = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const { filterid } = req.body;
        if (filterid.length === 0) {
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }

        await criteriaScoringModel.deleteMany({ _id: { $in: filterid } });
        return res.status(200).json({ "status": 200, "success": true, "message": "filter deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}