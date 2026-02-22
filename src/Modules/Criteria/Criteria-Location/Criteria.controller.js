import usermodel from "../../user/user.model.js";
import adminmodel from "../../admin/admin.model.js";
import LisitngMlsModel from "../../Mlsdatarecorder/listing/Listing.model.js";
import CriteriaLocationModel from "./Criteria.model.js";



export const getmatchinglocationdata = async (req, res) => {
  try {
    const platformuser = req.user?._id;
    if (!platformuser) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const verifyuser =
      (await usermodel.findById(platformuser)) ||
      (await adminmodel.findById(platformuser));

    if (!verifyuser) {
      return res.status(403).json({ success: false, message: "User not found" });
    }

    const { Geometry } = req.body;
    if (!Geometry || !Geometry.type || !Geometry.coordinates) {
      return res.status(400).json({ success: false, message: "Geometry is missing or invalid" });
    }

    let lat, long;

    // -------------------------------
    // Handle Geometry types
    // -------------------------------
    if (Geometry.type === "Point") {
      // GeoJSON: [lng, lat]
      [long, lat] = Geometry.coordinates;

    } else if (Geometry.type === "LineString") {
      const midIndex = Math.floor(Geometry.coordinates.length / 2);
      [long, lat] = Geometry.coordinates[midIndex];

    } else if (Geometry.type === "Polygon") {
      const points = Geometry.coordinates[0]; // outer ring

      const lats = points.map(p => p[1]);
      const lngs = points.map(p => p[0]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const findlocations = await LisitngMlsModel.find({
        Latitude: { $gte: minLat, $lte: maxLat },
        Longitude: { $gte: minLng, $lte: maxLng }
      }, { StandardStatus: true,Latitude:true,Longitude:true });


      return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": findlocations })
    } else {
      return res.status(400).json({ success: false, message: "Unsupported geometry type" });
    }

    // -------------------------------
    // Safety check
    // -------------------------------
    if (lat === undefined || long === undefined) {
      return res.status(400).json({ success: false, message: "Latitude or Longitude not found" });
    }

    // -------------------------------
    // Nearby search (Point / Line)
    // -------------------------------
    const delta = 0.05; // ≈ 5–6 km

    const findlocations = await LisitngMlsModel.find({
      Latitude: { $gte: lat - delta, $lte: lat + delta },
      Longitude: { $gte: long - delta, $lte: long + delta }
    }, { StandardStatus: true,Latitude:true,Longitude:true });

    return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": findlocations })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const savelocationfilters = async (req, res) => {
  try {
    const platformuser = req.user?._id;

    if (!platformuser) {
      return res.status(401).json({ status: 401, success: false, message: "Unauthorized access" });
    }

    const verifyuser = await usermodel.findById(platformuser) || await adminmodel.findById(platformuser);

    if (!verifyuser) {
      return res.status(403).json({ status: 403, success: false, message: "User not found" });
    }
    if (!req.body) {
      return res.status(400).json({ "status": 400, "success": false, "message": "Empty Body" });
    }
    const PlatformuserType = verifyuser.platformuser;
    const { geometry, filtername } = req.body;

    if (!geometry || !filtername) {
      return res.status(400).json({ "status": 400, "success": false, "message": "All fileds are required" })
    }

    if (filtername === "Default Autosave") {
      const checkexistingdefaultfilter = await CriteriaLocationModel.findOne({ filtername: "Default Autosave", userid: platformuser });
      if (checkexistingdefaultfilter) {
        return res.status(409).json({ "status": 409, "success": false, "message": "default filter already saved" });
      }

    }

    const checkexistingfiltername = await CriteriaLocationModel.findOne({ filtername: filtername, userid: platformuser });
    if (checkexistingfiltername) {
      return res.status(409).json({ "status": 409, "success": false, "message": "filtername is  already used" });
    }

    const createlocation = new CriteriaLocationModel({
      filtername,
      userid: platformuser,
      Platformuser: PlatformuserType,
      geometry

    })
    await createlocation.save();
    return res.status(201).json({ "status": 201, "success": true, "message": "location saved successfully" });


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

       const getallfilter = await CriteriaLocationModel.find({userid:platformuser}).sort({_id:1});
       if(getallfilter.length ===0){
        return res.json(204).json({ "status": 204, "success": true, "message": "No filter found" });
       }
       res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": getallfilter });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
}


// not in use this api 
// export const getlatlong = async (req, res) => {
//   try {
//     const platformuser = req.user?._id;
//     if (!platformuser) {
//       return res.status(401).json({ success: false, message: "Unauthorized access" });
//     }

//     const verifyuser =
//       (await usermodel.findById(platformuser)) ||
//       (await adminmodel.findById(platformuser));

//     if (!verifyuser) {
//       return res.status(403).json({ success: false, message: "User not found" });
//     }

//     const { Geometry } = req.body;
//     if (!Geometry || !Geometry.type || !Geometry.coordinates) {
//       return res.status(400).json({ success: false, message: "Geometry is missing or invalid" });
//     }

//     let lat, long;

//     // -------------------------------
//     // Handle Geometry types
//     // -------------------------------
//     if (Geometry.type === "Point") {
//       // GeoJSON: [lng, lat]
//       [long, lat] = Geometry.coordinates;

//     } else if (Geometry.type === "LineString") {
//       const midIndex = Math.floor(Geometry.coordinates.length / 2);
//       [long, lat] = Geometry.coordinates[midIndex];

//     } else if (Geometry.type === "Polygon") {
//       const points = Geometry.coordinates[0]; // outer ring

//       const lats = points.map(p => p[1]);
//       const lngs = points.map(p => p[0]);

//       const minLat = Math.min(...lats);
//       const maxLat = Math.max(...lats);
//       const minLng = Math.min(...lngs);
//       const maxLng = Math.max(...lngs);

//       const findlocations = await LisitngMlsModel.find({
//         Latitude: { $gte: minLat, $lte: maxLat },
//         Longitude: { $gte: minLng, $lte: maxLng }
//       }, {Latitude:true,Longitude:true });


//       return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": findlocations })
//     } else {
//       return res.status(400).json({ success: false, message: "Unsupported geometry type" });
//     }

//     // -------------------------------
//     // Safety check
//     // -------------------------------
//     if (lat === undefined || long === undefined) {
//       return res.status(400).json({ success: false, message: "Latitude or Longitude not found" });
//     }

//     // -------------------------------
//     // Nearby search (Point / Line)
//     // -------------------------------
//     const delta = 0.05; // ≈ 5–6 km

//     const findlocations = await LisitngMlsModel.find({
//       Latitude: { $gte: lat - delta, $lte: lat + delta },
//       Longitude: { $gte: long - delta, $lte: long + delta }
//     }, {Latitude:true,Longitude:true  });

//     return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": findlocations })

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };




