import offermodel from "./offer.model.js";
import adminmodel from "../admin/admin.model.js";
import usermodel from "../user/user.model.js";

export const createoffer = async (req, res) => {
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

        const { CompanyName, CompanyAddress, CompanyPhone, CompanyEmail, BuyerName, filtername, ListingId } = req.body;

        if (!CompanyName || !CompanyAddress || !CompanyPhone || !CompanyEmail || !BuyerName || !filtername || !ListingId) {
            return res.status(400).json({ "status": 400, "success": false, "message": "all fields are required" });
        }

        // let newfiltername = ""
        // if (filtername === "default") {
        //     const checkexistingdefaultfilter = await offermodel.findOne({ filtername: "default", userid: platformuser });
        //     if (checkexistingdefaultfilter) {
        //         return res.status(409).json({ "status": 409, "success": false, "message": "default filter already saved" });
        //     }
        //     newfiltername = "default"
        // }
        // if (filtername === "customfilter") {
        //     const checkthelastfiltername = await offermodel
        //         .find({ filtername: { $ne: "default" } })
        //         .sort({ _id: -1 })
        //         .limit(1);

        //     if (checkthelastfiltername.length !== 0) {
        //         const getfiltername = checkthelastfiltername[0].filtername;
        //         const num = parseInt(getfiltername.match(/\d+/)[0]);
        //         newfiltername = `filter${num + 1}`

        //     } else {
        //         newfiltername = "filter1"
        //     }
        // }

        const createoffer = new offermodel({
            Platformuser,
            userid: platformuser,
            BuyerName,
            CompanyName,
            CompanyAddress,
            CompanyPhone,
            CompanyEmail,
            filtername,
            ListingId
        })

        await createoffer.save();


        res.status(201).json({ "status": 201, "success": true, "message": "offer saved" });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const offerfiltername = async (req, res) => {
    try {

        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const { ListingId } = req.params;
        if (!ListingId) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Bad request" })
        }

        const getalltheoffer = await offermodel.find({ userid: platformuser, ListingId });
        if (getalltheoffer.length === 0) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }

        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": getalltheoffer })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}
