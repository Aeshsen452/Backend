import LisitngMlsModel from "./Listing.model.js";
import cron from "node-cron";
import axios from "axios";
import pLimit from "p-limit";
import path from "path";
import fs from "fs/promises"; 
import mlsimagesmodel from "../../MlsImagessaver/Images.model.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let isSyncRunning = false;
const s3Client = new S3Client({ region: "us-east-1" });


const filters = [
    "ListingId", 
    "OriginatingSystemName", 
    "ListPrice", 
    "BedroomsTotal", 
    "BathroomsTotalInteger", 
    "LivingArea", 
    "StandardStatus", 
    "Latitude", 
    "Longitude",
    "PublicRemarks",
    "PoolPrivateYN",
         "GarageSpaces",
            "GarageYN",
            "CarportYN",
            "CarportSpaces",
            "DaysOnMarket",
            "YearBuilt",
            "LotSizeSquareFeet",
            "LotSizeAcres",
            "CountyOrParish",
            "ConstructionMaterials",
            "PropertySubType",
            "PostalCode",
            "StateOrProvince",
            "City",
            "UnitNumber",
            "StreetSuffix",
            "StreetName",
            
       
].join(",");


const limit = pLimit(1);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processdata = async (listing, exactpath, token) => {
    const id = listing._id;
    try {
        await sleep(1000); // RPS Safety
        const filterQuery = encodeURIComponent(`OriginatingSystemName eq '${listing.OriginatingSystemName}' and ListingId eq '${listing.ListingId}'`);
        
        const response = await axios.get(
            `https://api.mlsgrid.com/v2/Property?$filter=${filterQuery}&$expand=Media`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const media = response.data.value[0]?.Media;
        if (!media || media.length === 0) {
            await LisitngMlsModel.findByIdAndUpdate(id, { needsImageSync: false });
            return;
        }

        const tasks = media.map((item, index) =>
            limit(async () => {
                await sleep(600); // Image download throttle
                try {
                    const ext = item.MediaKey ? "jpg" : (item.MediaType?.toLowerCase() || "jpeg");
                    const filename = `${id}-${index + 1}.${ext}`;

                    const imgResponse = await axios.get(item.MediaURL, {
                        responseType: "arraybuffer",
                        timeout: 10000
                    });

                    const params = {
      Bucket: "filtergoat-mls-image",
      Key: `MLSImages/${filename}`,
      Body: imgResponse.data,
      ContentType: imgResponse.headers['content-type'] || 'image/jpeg',
    };

                   await s3Client.send(new PutObjectCommand(params));
                    console.log(` The Images are at : -https://${params.Bucket}.s3.amazonaws.com/${params.Key}`);
                    await mlsimagesmodel.create({ mlslsitingid: id, imagepath: filename });
                } catch (e) { console.error(`Failed image: ${id} and the full reason for getting reject is `,e)}
            })
        );

        await Promise.all(tasks);
        await LisitngMlsModel.findByIdAndUpdate(id, { needsImageSync: false });
        console.log(`✅ Images Done for: ${listing.ListingId}`);

    } catch (err) { console.error(`Error processing: ${listing.ListingId}`); }
};

const fetchAllMlsData = async () => {
    const token = process.env.MLS_TOKEN;
    const url = process.env.MLS_URL;
    const exactpath = path.join(process.cwd(), "MLSImages");
    await fs.mkdir(exactpath, { recursive: true });

    let nextUrl = `${url}/Property`;

    try {
        while (nextUrl) {
            const res = await axios.get(nextUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const listings = res.data.value;
            if (!listings || listings.length === 0) break;


            const operations = listings.map(item => ({
                updateOne: {
                    filter: { ListingId: item.ListingId, OriginatingSystemName: item.OriginatingSystemName },
                    update: { $set: { ...item, lastSync: new Date() } },
                    upsert: true
                }
            }));
            
            const bulkResult = await LisitngMlsModel.bulkWrite(operations);
            console.log(`📦 DB Upserted ${listings.length} records.`);

            const syncedListings = await LisitngMlsModel.find({
                ListingId: { $in: listings.map(l => l.ListingId) },
                needsImageSync: true 
            }).lean();

            console.log(`📸 Starting Image sync for ${syncedListings.length} new listings...`);
            
            for (let listing of syncedListings) {
                await processdata(listing, exactpath, token);
            }

            // nextUrl = res.data["@odata.nextLink"] || null;
        
             nextUrl =  null;
            
            await sleep(2000); 
        }
    } catch (err) {
        console.error("Sync Error:", err.message);
    }
};

export const startCronJob = async() => {
   
    cron.schedule("0 */8 * * *", async () => {
        if (isSyncRunning) {
        console.log("Skipping this cycle: Previous sync is still running...");
        return; 
    }
        try {
      isSyncRunning = true; 
        console.log("Starting MLS data fetch...");
        
        await fetchAllMlsData();

        } catch (err) {
            console.log("Cron job error:", err.message);
        }finally {
        isSyncRunning = false; 
        console.log("Sync cycle finished, lock released.");
    }
    });
};

export const initalStart = async () => {
  try {
    console.log("--- Initial Sync Started ---");

    console.log("Step 1: Fetching MLS Data...");
    await fetchAllMlsData(); 
    console.log("Step 1: Data Fetching Completed.");

    console.log("Step 2: Starting Image Download...");
    await getimages();
    console.log("Step 2: Image Downloading Completed.");

    console.log("--- Initial Sync Finished Successfully ---");
  } catch (error) {
    console.error("Error in initialStart:", error.message);
  }
};

export const creatingLisitngdata = async (req, res) => {
    try {
        const { data } = req.body;
        const adddata = new LisitngMlsModel({
            data: data
        }
        )
        await adddata.save();
        return res.status(200).json({ "status": 201, "success": true, "message": "data inserted successfully" })
    } catch (error) {
        console.log(error)
    }
}

export const updateLisitngdata = async (req, res) => {
    try {

        const { Listingid } = req.params;
        if (!Listingid) {
            return res.status(400).send("bad request");
        }
        const { data } = req.body;
        const updatedata = await LisitngMlsModel.findByIdAndUpdate(Listingid, {
            $push: {
                data: data
            }
        });

        return res.status(200).json({ "status": 201, "success": true, "message": "data updated successfully" })
    } catch (error) {
        console.log(error)
    }
}



































































































// const limit = pLimit(2);

// const processdata = async (data, exactpath, token) => {
//   const id = data._id;

//   try {
//     // 1️⃣ Fetch media for this listing
//     const response = await axios.get(
//       `https://api.mlsgrid.com/v2/Property?$filter=OriginatingSystemName eq '${data.OriginatingSystemName}' and ListingId eq '${data.ListingId}'&$expand=Media`,
//       {
//         headers: { Authorization: `Bearer ${token}` }
//       }
//     );

//     const media = response.data.value[0]?.Media; // MLS API returns data.value array
//     if (!media || media.length === 0) {
//       console.log("No media found for listing:", data.ListingId);
//       return;
//     }

//     // 2️⃣ Download all media images with concurrency limit
//     const tasks = media.map((item, index) =>
//       limit(async () => {
//         const ext = item.MediaType?.toLowerCase() || "jpeg"; 
//         const filename = `${id}-${Date.now()}-${index + 1}.${ext}`
//         const filepath = path.join(exactpath, filename);
//         const imgResponse = await axios.get(item.MediaURL, { responseType: "arraybuffer" });

//         // 3️⃣ Save image to disk
//         await fs.writeFile(filepath, imgResponse.data);

//         // 4️⃣ Save path to MongoDB
//         const insertdata = new mlsimagesmodel({
//           mlslsitingid: id,
//           imagepath: filename
//         });
//         await insertdata.save();

//         console.log("Saved:", filename);
//         console.log(id);
//       })
//     );

//     await Promise.all(tasks); // wait for all downloads

//   } catch (err) {
//     console.log("Error fetching media for listing:", data.ListingId);
//     console.log("Error response data:", err.response?.data);
//     console.log("Error headers:", err.response?.headers);
//     console.log("Error message:", err.message);
//   }
// };



// const getimages = async () => {
//   const filepath = process.cwd();
//   const fullpath = path.join(filepath, "MLSImages");
//   const exactpath = fullpath.replaceAll("\\", "/");

//   // Ensure folder exists
//   await fs.mkdir(exactpath, { recursive: true });

//   const getalllistingdata = await LisitngMlsModel.find({}, {ListingId :true,OriginatingSystemName :true,ModificationTimestamp:true}).skip();
//  const token  = process.env.MLS_TOKEN
//  let start = 0

//   // Process all listings sequentially (or you could use Promise.all with limit)
//   for (let listing of getalllistingdata) {
//     console.log(`${start+1} is downolding`);
//     await processdata(listing, exactpath,token);
//      start++

//   }
// };

// export const startdownlodingimages =() =>{
//     cron.schedule("0 */5 * * *", async () => {
//         console.log("starting downolded images");
//         getimages();
//          console.log(" downolded images finished ");
// })
// }

// export const startCronJob = () => {
//     const token = process.env.MLS_TOKEN;
//     const url = process.env.MLS_URL;

//     cron.schedule("*/10 * * * *", async () => {
//         try {
      
//             console.log("Running MLS data fetch...");

//             const checkmlsrecord = await LisitngMlsModel.countDocuments();
//             const startDate = new Date();
//             startDate.setUTCHours(startDate.getHours()-1);
//             startDate.setUTCMinutes(startDate.getMinutes()-2);

            

//             if(checkmlsrecord ===0){
//               const res = await axios.get(
//                 `${url}/Property?$filter=ModificationTimestamp gt ${startDate}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const listings = res.data.value;
//             if (!listings || listings.length === 0) {
//                 console.log("No new MLS records found.");
//                 return;
//             }
//              const addingdata = listings.map((items)=>{
//                 return {
//                     ...items,
//                     createdDate: new Date()
//                 }
//             })

//             await LisitngMlsModel.insertMany(addingdata);
//             console.log(`${listings.length} MLS listings saved.`);

//             }else{
//              const res = await axios.get(
//                 `${url}/Property?$filter=ModificationTimestamp gt ${startDate}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const listings = res.data.value;
//             if (!listings || listings.length === 0) {
//                 console.log("No new updated MLS records found.");
//                 return;
//             }

//             const addingdata = listings.map((items)=>{
//                 return {
//                   modifytime : items.ModificationTimestamp,
//                   listingid : items.ListingId
//                 }
//             })
//             console.log(addingdata)

//             }

//         } catch (err) {
//             console.log("Cron job error:", err.message);
//         }
//     });
// };



// const limit = pLimit(1); 
// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const processdata = async (listing, exactpath, token) => {
//   const id = listing._id;

//   try {
//     // const response = await axios.get(
//     //   `https://api.mlsgrid.com/v2/Property?$filter=OriginatingSystemName eq '${listing.OriginatingSystemName}' and ListingId eq '${listing.ListingId}'&$expand=Media`,
//     //   { headers: { Authorization: `Bearer ${token}` } }
//     // );

//     // Aisa likhein:

// await sleep(1000);
//     const filterQuery = encodeURIComponent(`OriginatingSystemName eq '${listing.OriginatingSystemName}' and ListingId eq '${listing.ListingId}'`);


// const response = await axios.get(
//   `https://api.mlsgrid.com/v2/Property?$filter=${filterQuery}&$expand=Media`,
//   { headers: { Authorization: `Bearer ${token}` } }
// );


//     const media = response.data.value[0]?.Media;
    

//     if (!media || media.length === 0) {
//       console.log(`No media for: ${listing.ListingId}`);
//       await LisitngMlsModel.findByIdAndUpdate(id, { needsImageSync: false });
//       return;
//     }

//     const tasks = media.map((item, index) =>
//       limit(async () => {
//         await sleep(600);
//         try {
//           const ext = item.MediaKey ? "jpg" : (item.MediaType?.toLowerCase() || "jpeg"); 
//           const filename = `${id}-${index + 1}.${ext}`;
//           const filepath = path.join(exactpath, filename);

//           const imgResponse = await axios.get(item.MediaURL, { 
//             responseType: "arraybuffer",
//             timeout: 10000 
//           });

//           await fs.writeFile(filepath, imgResponse.data);

//           await mlsimagesmodel.create({
//             mlslsitingid: id,
//             imagepath: filename
//           });
//         } catch (downloadErr) {
//           console.error(`Failed to download image ${index} for ${id}:`, downloadErr.message);
//         }
//       })
//     );

//     await Promise.all(tasks);

   
//     await LisitngMlsModel.findByIdAndUpdate(id, { needsImageSync: false });
//     console.log(` All images processed for ListingId: ${listing.ListingId}`);

//   } catch (err) {
//     console.error(` Error in processdata for ${listing.ListingId}:`, err.message);
//   }
// };

// const getimages = async () => {
//   const exactpath = path.join(process.cwd(), "MLSImages");
//   await fs.mkdir(exactpath, { recursive: true });

//   const pendingListings = await LisitngMlsModel.find(
//     { needsImageSync: true }, 
//     { ListingId: true, OriginatingSystemName: true }
//   ).limit(10);

//   const token = process.env.MLS_TOKEN;
//   console.log(`Found ${pendingListings.length} listings for image sync.`);

//   // Ek ek karke listing process karein (Listing level par serial, Image level par parallel)
//   for (let listing of pendingListings) {
//     await processdata(listing, exactpath, token);
//   }
// };

// export const startdownlodingimages = () => {
//   cron.schedule("0 0 * * *", async () => {
//     console.log("--- Starting Image Sync Job ---");
//     await getimages();
//     console.log("--- Image Sync Job Finished ---");
//   });
// };



//  const fetchAllMlsData = async () => {
//     const token = process.env.MLS_TOKEN;
//     const url = process.env.MLS_URL;
//     let nextUrl = `${url}/Property`;

//     try {
//         while (nextUrl) {
//             const res = await axios.get(nextUrl, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });

//             const listings = res.data.value;
//             if (!listings || listings.length === 0) break;

//        const operations = listings.map(item => ({
//         updateOne: {
//         filter: { 
//             ListingId: item.ListingId, 
//             OriginatingSystemName: item.OriginatingSystemName 
//         }, 
//         update: { $set: { ...item, lastSync: new Date() } },
//         upsert: true 
//     }
//      }));
//             await LisitngMlsModel.bulkWrite(operations);
//             console.log(`Processed ${listings.length} records (Upserted).`);

            
//             nextUrl = res.data["@odata.nextLink"] || null;
//               // nextUrl = null;
//         }
//     } catch (err) {
//         console.error("Sync Error:", err.message);
//     }
// };

// export const startCronJob = async() => {
   
//     cron.schedule("0 0 * * *", async () => {
//         if (isSyncRunning) {
//         console.log("Skipping this cycle: Previous sync is still running...");
//         return; 
//     }
//         try {
//       isSyncRunning = true; 
//         console.log("Starting MLS data fetch...");
        
//         await fetchAllMlsData();

//         } catch (err) {
//             console.log("Cron job error:", err.message);
//         }finally {
//         isSyncRunning = false; 
//         console.log("Sync cycle finished, lock released.");
//     }
//     });
// };


// export const startCronJob = () => {
//     const token = process.env.MLS_TOKEN;
//     const url = process.env.MLS_URL;

//     cron.schedule("*/2 * * * *", async () => { // runs every 3 hour
//         try {
//             const isoDate = new Date().toISOString(); 
//             // return console.log(isoDate);
//             console.log("Running hourly MLS data fetch...");
//             try {
//                 await LisitngMlsModel.deleteMany({});
//                 console.log("all the data deleted succesfully")
//             } catch (error) {
//                 return console.log(error)
//             }


//             const res = await axios.get(
//                 `${url}/Property?$filter=ModificationTimestamp gt 2025-12-01T06:37:00.040Z}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 }
//             );
//             const data = res.data.value
//             if (data.length > 0 && data) {
//                 await LisitngMlsModel.insertMany(data)

//                 console.log(`${res.data.value.length} new MLS records saved!`);
//             } else {
//                 console.log("No new MLS records found.");
//             }

//         } catch (err) {
//             console.log("Cron job error:", err.message);
//         }
//     });
// };






// export const startCronJob = () => {
//     const token = process.env.MLS_TOKEN;
//     const url = process.env.MLS_URL;

//     cron.schedule("* * * * *", async () => {
//         try {
//             const isoDate = new Date().toISOString();
//             console.log("Running MLS data fetch...");

//             const checkmlsmodel = await LisitngMlsModel.countDocuments();
//             console.log(typeof checkmlsmodel)
         
//             if(checkmlsmodel ===0){
//                 const res = await axios.get(
//                 `${url}/Property?$filter=ModificationTimestamp gt 2025-12-01T06:37:00.040Z`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );

//             const listings = res.data.value;

//             if (!listings || listings.length === 0) {
//                 console.log("No new MLS records found.");
//                 return;
//             }

//             }

            
//             await LisitngMlsModel.insertMany(listings);
//             console.log(`${listings.length} MLS listings saved.`);

//             // 3. Fetch images for each listing (NO INTERVAL)
//             processData(listings);
           

//         } catch (err) {
//             console.log("Cron job error:", err.message);
//         }
//     });
// };