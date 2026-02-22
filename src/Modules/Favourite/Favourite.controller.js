import favouritemodel from "./Favourite.model.js";
import LisitngMlsModel from "../Mlsdatarecorder/listing/Listing.model.js";
import usermodel from "../user/user.model.js";
import adminmodel from "../admin/admin.model.js";

export const createFavourirte = async (req, res) => {
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

        const checkexistingid = await favouritemodel.findOne({ userid: platformuser, FavouriteResults: Lisitngid });

        if (checkexistingid) {
            const deleteid = checkexistingid._id;
            await favouritemodel.findByIdAndDelete(deleteid);
            return res.status(200).json({ "status": 200, "success": true, "message": "unsaved from favourite" })
        }

        const createFavourite = new favouritemodel({
            userid: platformuser,
            Platformuser,
            FavouriteResults: Lisitngid
        });

        await createFavourite.save();
        res.status(201).json({ "status": 201, "success": true, "message": "saved to favourite" });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const totalfavouirte = async (req, res) => {
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

        const gettoalfavourites = await favouritemodel.countDocuments({ userid: platformuser });
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": gettoalfavourites });


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

        const getfavourites = await favouritemodel.findOne({
            userid: platformuser,
            FavouriteResults: listingid
        });

        if (getfavourites) {
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "exists": true });
        }
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful but id not found", "exists": false });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}

export const getallfavouirtes = async (req, res) => {
    try {
        
        const platformuser = req.user?._id;

        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const getfavourites = await favouritemodel.find({userid:platformuser}).populate("FavouriteResults");
 
        
        if (getfavourites.length === 0) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" });
        }
        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": getfavourites });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}