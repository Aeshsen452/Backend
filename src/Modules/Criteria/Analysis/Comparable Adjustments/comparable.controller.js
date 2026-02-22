import usermodel from "../../../user/user.model.js";
import adminmodel from "../../../admin/admin.model.js";
import comparableadjustmentmodel from "./comparable.mode.js";

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
            const checkexistingdefaultfilter = await comparableadjustmentmodel.findOne({ filtername: "default", userid: platformuser });
            if (checkexistingdefaultfilter) {
                return res.status(409).json({ "status": 409, "success": false, "message": "default filter already saved" });
            }
          
        }
        // if (filtername === "custom") {
        //     const checkthelastfiltername = await comparableadjustmentmodel
        //         .find({ filtername: { $ne: "default" } }) 
        //         .sort({ _id: -1 })                         
        //         .limit(1);

        //     if (checkthelastfiltername.length !== 0) {
        //         const getfiltername = checkthelastfiltername[0].filtername;
        //         const num = parseInt(getfiltername.match(/\d+/)[0]);
        //          newfiltername = `filter${num+1}`

        //     } else {
        //         newfiltername = "filter1"
        //     }
        // }
        const checkexistingfiltername = await comparableadjustmentmodel.findOne({ filtername: filtername, userid: platformuser });
         if (checkexistingfiltername) {
                return res.status(409).json({ "status": 409, "success": false, "message": "filtername is  already used" });
            }

        const createcomparableadjustment = new comparableadjustmentmodel({
            filtername,
            userid: platformuser,
            Platformuser: PlatformuserType,
            adjustment1:data.adjustment1,
            adjustment2:data.adjustment2
        })
        await createcomparableadjustment.save();
        return res.status(201).json({ "status": 201, "success": true, "message": "comparableadjustment saved successfully" });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}


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

       const getallfilter = await comparableadjustmentmodel.find({userid:platformuser},{filtername:true,filterpagepath:true}).sort({_id:1});
       if(getallfilter.length ===0){
        return res.status(204).json({ "status": 204, "success": true, "message": "No filter found" });
       }
       res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": getallfilter });
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

        const verifyfilterid = await comparableadjustmentmodel.findById(filterid);
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

        const verifyfilterid = await comparableadjustmentmodel.findById(filterid);
        if(!verifyfilterid){
            return res.status(204).json({ "status": 204, "success": true, "message": "No content" })
        }

        const updatelisting = await comparableadjustmentmodel.findByIdAndUpdate(filterid,data,{new:true});
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
        
        await comparableadjustmentmodel.deleteMany({ _id: { $in: filterid } },{new:true});
        return res.status(200).json({ "status": 200, "success": true, "message": "filter deleted successfully"});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}