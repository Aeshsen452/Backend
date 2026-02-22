// import { Schema,model } from "mongoose";


// const LisitngMlsSchema = new Schema({
// },{strict:false})

// const LisitngMlsModel = model("listingMls",LisitngMlsSchema);
// export default LisitngMlsModel;




// import { Schema, model } from "mongoose";

// const LisitngMlsSchema = new Schema({

//     ListingId: { type: String, unique: true, index: true },


//     needsImageSync: { type: Boolean, default: true, index: true },

//     ModificationTimestamp: { type: Date, index: true },

// }, { strict: false, timestamps: true });



// LisitngMlsSchema.index({ ListingId: 1, OriginatingSystemName: 1 }, { unique: true });

// const LisitngMlsModel = model("listingMls", LisitngMlsSchema);
// export default LisitngMlsModel;










// import { Schema, model } from "mongoose";

// const LisitngMlsSchema = new Schema({
//     ListingId: { type: String, index: true },
//     OriginatingSystemName: { type: String, index: true },

//     needsImageSync: { type: Boolean, default: true, index: true },

//     ModificationTimestamp: { type: Date, index: true },

//     ListingId: true,
//     PoolPrivateYN: true,
//     StandardStatus: true,
//     GarageSpaces: true,
//     GarageYN: true,
//     CarportYN: true,
//     CarportSpaces: true,
//     PublicRemarks: true,
//     DaysOnMarket: true,
//     YearBuilt: true,
//     Latitude: true,
//     Longitude: true,
//     BedroomsTotal: true,
//     BathroomsTotalInteger: true,
//     LivingArea: true,
//     LotSizeSquareFeet: true,
//     LotSizeAcres: true,


// }, { strict: false, timestamps: true });

// LisitngMlsSchema.index({ ListingId: 1, OriginatingSystemName: 1 }, { unique: true });

// const LisitngMlsModel = model("listingMls", LisitngMlsSchema);
// export default LisitngMlsModel;





import { Schema, model } from "mongoose";

const LisitngMlsSchema = new Schema({
    // Primary Identifiers
    ListingId: { type: String, index: true },
    OriginatingSystemName: { type: String, index: true },

    // Location & Search Fields (Manatee, Sarasota etc. ke liye)
    CountyOrParish: { type: String, index: true },
    City: { type: String, index: true },
    StandardStatus: { type: String, index: true },
    
    // Physical Attributes
    BedroomsTotal: { type: Number, index: true },
    BathroomsTotalInteger: { type: Number, index: true },
    LivingArea: { type: Number, index: true },
    YearBuilt: { type: Number, index: true },
    
    // Garage & Parking
    GarageYN: { type: Boolean, index: true },
    GarageSpaces: { type: Number, index: true },
    CarportYN: { type: Boolean, index: true },
    CarportSpaces: { type: Number, index: true },
    
    // Lot & Pool
    LotSizeSquareFeet: { type: Number, index: true },
    LotSizeAcres: { type: Number, index: true },
    PoolPrivateYN: { type: Boolean, index: true },
    
    // Geo & Timestamps
    Latitude: { type: Number, index: true },
    Longitude: { type: Number, index: true },
    DaysOnMarket: { type: Number, index: true },
    ModificationTimestamp: { type: Date, index: true },
    
  
    needsImageSync: { type: Boolean, default: true, index: true },
    
    PublicRemarks: { type: String } 

}, { strict: false, timestamps: true });

// Compound Unique Index
LisitngMlsSchema.index({ ListingId: 1, OriginatingSystemName: 1 }, { unique: true });

const LisitngMlsModel = model("listingMls", LisitngMlsSchema);
export default LisitngMlsModel;