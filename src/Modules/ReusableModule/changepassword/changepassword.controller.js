import adminmodel from "../../admin/admin.model.js"
import bcrypt from "bcrypt";


export const changepassword = async (req, res) => {
    try {
        const platformuserid = req.user?._id;
        if (!platformuserid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" })
        }

        const { password, oldpassword } = req.body;

        const platformuser = await adminmodel.findById(platformuserid)
            //  || await usermodel.findById(platformuserid)
            ;

        if (oldpassword) {
            const platformusersavedpass = platformuser.password
            const checkpass = await bcrypt.compare(oldpassword, platformusersavedpass);
            if (!checkpass) {
                return res.status(403).json({ "status": 403, "success": false, "message": "Forbidden" });
            }
        }

        if (!password) {
            return res.status(404).json({ "status": 404, "success": false, "message": "Resource not found" })
        }
        const securepass = await bcrypt.hash(password, 10);

        if (platformuser.platformuser === "admin") {
            await adminmodel.findByIdAndUpdate(platformuserid, { password: securepass }, { new: true });
            return res.status(201).json({ "status": 201, "success": true, "message": "Resource created successfully", "data": "passwordchange successfully" });
        }



    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
} 


export const resetpassword = async (req, res) => {
    try {
        const adminid = req.user?._id;
        if (!adminid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" })
        }
        
       const verifyadmin = await adminmodel.findById(adminid);
       if(!verifyadmin){
        return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" })
       }

       const {newpassword} = req.body;
       const securepass = await bcrypt.hash(newpassword,10);
       await adminmodel.findByIdAndUpdate(adminid,{password:securepass},{new:true});

       res.status(201).json({ "status": 201, "success": true, "message": "Resource created successfully", "data": "password created successfully" });

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
} 