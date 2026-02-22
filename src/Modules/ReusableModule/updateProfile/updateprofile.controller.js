import adminmodel from "../../admin/admin.model.js";
import bcrypt from "bcrypt";


export const updateProfile = async (req, res) => {
   try {
      const userid = req.user?._id;
      const upload_pic = req.file?.filename||null;

      const { name, email ,newpassword,oldpassword } = req.body;

      if (!userid) {
         return res.status(401).json({ "status": 401, "success": false, "message": "Unauthorized access" });
      }
    const verifyadmin = await adminmodel.findById(userid);

    if(!verifyadmin){
      return res.status(404).json({ "status": 404, "success": false, "message": "admin not found" });
    }
     
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (upload_pic) updateData.profileImage = upload_pic;
      if(newpassword && oldpassword) {
       const adminpass = verifyadmin.password;
       const comparepass = await bcrypt.compare(oldpassword,adminpass);
       if(!comparepass){
         return res.status(403).json({ "status": 403, "success": false, "message": "invalid password" });
       }
       const securepass = await bcrypt.hash(newpassword,10);
       updateData.password = securepass
      }


      if (verifyadmin.platformuser === "admin") {
         const updateprofile = await adminmodel.findByIdAndUpdate(userid, updateData, { new: true });
         return res.status(201).json({ "status": 201, "success": true, "message": "Resource created successfully"});
      }


   } catch (error) {
      res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
      console.log(error);
   }
};

