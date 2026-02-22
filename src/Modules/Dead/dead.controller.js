import Deadmodel from "./dead.model.js";
import LisitngMlsModel from "../Mlsdatarecorder/listing/Listing.model.js";
import usermodel from "../user/user.model.js";
import adminmodel from "../admin/admin.model.js";

export const createdead = async (req, res) => {
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

        const checkexistingid = await Deadmodel.findOne({ userid: platformuser, DeadResults: Lisitngid });
        if (checkexistingid) {
             await Deadmodel.findByIdAndDelete(checkexistingid._id);
            return res.status(203).json({ "status": 203, "success": true, "message": "Dead unsaved" });
        }

        const createdead = new Deadmodel({
            userid: platformuser,
            Platformuser,
            DeadResults: Lisitngid
        });

        await createdead.save();
        res.status(201).json({ "status": 201, "success": true, "message": "saved to dead" });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const getidexists = async (req, res) => {
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
        const { listingid } = req.params;

        if (!listingid) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Bad request" })
        }

        const getdead = await Deadmodel.findOne({
            userid: platformuser,
            DeadResults: listingid
        });

        if (getdead) {
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "exists": true });
        }
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful but id not found", "exists": false });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}