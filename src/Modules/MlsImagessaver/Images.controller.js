import mlsimagesmodel from "./Images.model.js";
import adminmodel from "../admin/admin.model.js";
import usermodel from "../user/user.model.js";


export const getimagesurls = async (req,res)=>{
   try {
        const platformuser = req.user?._id;
         
        if (!platformuser) {
            return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
        }

        const verifyuser =await usermodel.findById(platformuser) ||await adminmodel.findById(platformuser);

        if (!verifyuser) {
            return res.status(403).json({ status: 403, success: false, message: "User not found" });
        }

        const {mlslsitingid} = req.params;
        if(!mlslsitingid){
            return res.status(400).json({ "status": 400, "success": false, "message": "filterid is missing" })
        }
        
       const findallimagesdata = await mlsimagesmodel.find({mlslsitingid});
       if(findallimagesdata.length===0){
        return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
       }
       return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": findallimagesdata })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}