import analysismodel from "./Analysis.model.js";
import usermodel from "../user/user.model.js";
import adminmodel from "../admin/admin.model.js";
import LisitngMlsModel from "../Mlsdatarecorder/listing/Listing.model.js";



export const createanalysis = async(req,res) =>{
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const Platformuser = verifyuser.platformuser;
        if (!Platformuser) {
            return res.status(403).json({ "status": 403, "success": false, "message": "Forbidden" })
        }

        const { Lisitngid } = req.body;

        if (!Lisitngid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "id is missing" });
        }

        const verifylistingid = await LisitngMlsModel.findById(Lisitngid);
        if (!verifylistingid) {
            return res.status(404).json({ "status": 404, "success": false, "message": "id not found" })
        }

        const checkexistingid = await analysismodel.findOne({ userid: platformuser, AnalysisResults: Lisitngid });

        if (checkexistingid) {
             await analysismodel.findByIdAndDelete(checkexistingid._id);
            return res.status(203).json({ "status": 203, "success": true, "message": "analysis unsaved" })
        }

        const createFavourite = new analysismodel({
            userid: platformuser,
            Platformuser,
            AnalysisResults: Lisitngid
        });

        await createFavourite.save();
        res.status(201).json({ "status": 201, "success": true, "message": "items saved to analysis " });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const totalanalysis = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const Platformuser = verifyuser.platformuser;
        if (!Platformuser) {
            return res.status(403).json({ "status": 403, "success": false, "message": "Forbidden" })
        }

        const gettoalfavourites = await analysismodel.find({ userid: platformuser }).populate("AnalysisResults");

        if(gettoalfavourites.length ===0){
            return res.status(200).json({ "status": 200, "success": true, "message": "no analysis found" })
        }
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": gettoalfavourites });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }

}

export const existid = async (req,res) =>{
   const platformuser = req.user?._id;
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const Platformuser = verifyuser.platformuser;
        if (!Platformuser) {
            return res.status(403).json({ "status": 403, "success": false, "message": "Forbidden" })
        } 
        
        const { Lisitngid } = req.params;

        if (!Lisitngid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "id is missing" });
        }

        const existid = await analysismodel.findOne({userid:platformuser,AnalysisResults:Lisitngid});
        if(existid){
            return res.status(200).json({"status": 200, "success": true, "message": true })
        }
       return res.status(200).json({"status": 200, "success": true, "message": false })
}