import usermodel from "../user/user.model.js";
import adminmodel from "./admin.model.js";
import jwt from "jsonwebtoken";



export const signupAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Resource not found" });
        }
        const newadmin = new adminmodel({
            email, password
        });
        await newadmin.save();

        res.status(201).json({ "status": 201, "success": true, "message": "Resource created successfully", "data": newadmin });

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ "status": 400, "success": false, "message": "Resource not found" });
        }

        const admin = await adminmodel.findOne({ email });
        if (!admin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "email id not found" });
        }

        const adminpass = admin.password;

        if (adminpass !== password) {
            return res.status(401).json({ "status": 401, "success": false, "message": "invalid password" });
        }

        const payload = admin.toObject();
        delete payload.password
        delete payload.otp
        delete payload.otpCreated

        const token = jwt.sign(payload, process.env.SECREATE_KEY);

        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": token, });

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}


export const getprofile = async (req, res) => {
    try {
        const userid = req.user?._id;
        if (!userid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
        }
        const verifyadmin = await adminmodel.findById(userid);

        if (!verifyadmin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
        }
        res.status(200).json({ "status": 200, "success": true, "message": "fetching successfully", "data": verifyadmin })


    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}

export const deleteadmin = async (req, res) => {
    try {
        const adminid = req.user?._id;
        if (!adminid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
        }
        const verifyadmin = await adminmodel.findById(adminid);

        if (!verifyadmin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
        }

        await adminmodel.findByIdAndDelete(adminid);
        res.status(204).json({ "status": 204, "success": true, "message": "admin deleted successfully" })

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}

export const createadmin = async (req, res) => {
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
        const newadmin = new adminmodel({
            email, password, name
        });
        await newadmin.save();

        res.status(201).json({ "status": 201, "success": true, "message": "admin created successfully" });

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}

export const getallmanageuser = async (req, res) => {
    try {
        const adminid = req.user?._id;

        if (!adminid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
        }
        const verifyadmin = await adminmodel.findById(adminid);

        if (!verifyadmin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
        }

        const admins = await adminmodel.find();

        const alladmincreation = admins.filter(admin => admin._id != adminid);
        const allusers = await usermodel.find();

        if (alladmincreation.length === 0 && allusers.length === 0) {
            return res.status(204).json({ "status": 204, "success": true, "message": "No Data Available" })
        } else if (alladmincreation.length === 0) {
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": allusers })
        } else if (allusers.length === 0) {
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": alladmincreation })
        } else {
            const combinedata = [
                ...alladmincreation, ...allusers
            ];
            return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": combinedata })
        }


    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}

export const deletemanageuser = async (req, res) => {
    try {
        const adminid = req.user?._id;

        if (!adminid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
        }
        const verifyadmin = await adminmodel.findById(adminid);

        if (!verifyadmin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
        }

        const { ids } = req.body;
        if (!ids) {
            return res.status(403).json({ "status": 403, "success": false, "message": "Atleast one user/admin is required to delete" })
        }

        ids.map(async (id) => {
            const deletedid = await adminmodel.findByIdAndDelete(id) || await usermodel.findByIdAndDelete(id);
            if (!id) {
                return res.status(404).json({ "status": 404, "success": false, "message": "id not found" });
            }
        })

        res.status(200).json({ "status": 200, "success": true, "message": "all users deleted successful" });

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}
export const changepassword = async (req, res) => {
    try {
        const adminid = req.user?._id;

        if (!adminid) {
            return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
        }
        const verifyadmin = await adminmodel.findById(adminid);

        if (!verifyadmin) {
            return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
        }
        const { userid,newpassword} = req.body;
        if (!userid || !newpassword) {
            return res.status(403).json({ "status": 403, "success": false, "message": "filed is required to change" })
        }
        const user = await adminmodel.findByIdAndUpdate(userid,{password:newpassword},{new:true}) || await usermodel.findByIdAndUpdate(userid,{password:newpassword},{new:true})

        return res.status(201).json({"status": 201, "success": true, "message": "password change successfully"})

    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}