import usermodel from "./user.model.js";
import adminmodel from "../admin/admin.model.js";

export const signupUser = async (req, res) => {
    try {
        const adminid = req.user?._id;
       
        if (!adminid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
        }
        const verifyadmin = await adminmodel.findById(adminid);

        if (!verifyadmin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
        }

        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Resource not found" });
        }
        const newuser = new usermodel({
            email, password, name
        });
        await newuser.save();

        res.status(201).json({ "status": 201, "success": true, "message": "Resource created successfully", "data": newuser });

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}