import matchtolerancemodel from "./matchtolerance.model.js";
import usermodel from "../../../user/user.model.js";
import adminmodel from "../../../admin/admin.model.js";

export const createdata = async (req, res) => {
    try {
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }
        const PlatformuserType = verifyuser.platformuser;
        const data = req.body;
        const filtername = data.filtername;

        if (filtername === "Default Autosave") {
            const checkexistingdefaultfilter = await matchtolerancemodel.findOne({ filtername: "default", userid: platformuser });
            if (checkexistingdefaultfilter) {
                return res.status(409).json({ "status": 409, "success": false, "message": "default filter already saved" });
            }

        }
        const checkexistingfiltername = await matchtolerancemodel.findOne({ filtername: filtername, userid: platformuser });
        if (checkexistingfiltername) {
            return res.status(409).json({ "status": 409, "success": false, "message": "filtername is  already used" });
        }


        const creatematchtolreance = new matchtolerancemodel({
            filtername,
            userid: platformuser,
            Platformuser: PlatformuserType,
            milesaway: data.milesaway,
            any: data.any,
            privatepools: data.privatepools,
            garages: data.garages,
            carports: data.carports,
            publickeywords: data.publickeywords
        })
        await creatematchtolreance.save();
        return res.status(201).json({ "status": 201, "success": true, "message": "matchtolreance saved successfully" });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

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

        const getallfilter = await matchtolerancemodel.find({ userid: platformuser }, { filtername: true, filterpagepath: true }).sort({ _id: 1 });
        if (getallfilter.length === 0) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No filter found" });
        }
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": getallfilter });
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

        const verifyfilterid = await matchtolerancemodel.findById(filterid);
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

        const verifyfilterid = await matchtolerancemodel.findById(filterid);
        if (!verifyfilterid) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }

        const obj = {};

        // 1. Miles Away handling (Fixing 's' and ensuring it's not empty)
        if (data.mileaway) {
            // Schema name 'milesaway' (with 's')
            obj.milesaway = {
                rangebar: data.mileaway.rangebar ?? 0,
                daysback: data.mileaway.daysback ?? 0,
                sold: Boolean(data.mileaway.sold),
                active: Boolean(data.mileaway.active),
                pending: Boolean(data.mileaway.pending),
                offmarket: Boolean(data.mileaway.offmarket),
            };
        }

        // 2. Any field
        if (data.any) obj.any = data.any;

        // 3. Garages & Carports
        if (data.garages) obj.garages = data.garages;
        if (data.carports) obj.carports = data.carports;

        // 4. Private Pools
        if (data.privatepools !== undefined) obj.privatepools = data.privatepools;

        // 5. Public Keywords (Schema uses all lowercase 'publickeywords')
        if (data.publicKeywords || data.publickeywords) {
            obj.publickeywords = data.publicKeywords || data.publickeywords;
        }

        console.log("Final Update Object:", obj);

        // Update using $set to prevent overwriting other top-level fields
        const updatelisting = await matchtolerancemodel.findByIdAndUpdate(
            filterid,
            { $set: obj },
            { new: true, runValidators: true }
        );
        return res.status(201).json({ "status": 201, "success": true, "message": "filter update successfully", updatelisting });

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

        await matchtolerancemodel.deleteMany({ _id: { $in: filterid } });
        return res.status(200).json({ "status": 200, "success": true, "message": "filter deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}