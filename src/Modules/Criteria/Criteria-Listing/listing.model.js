// import { Schema, model } from "mongoose";

// const ListingSchema = new Schema({
//     MarketStatus: [],
//     PropertyType: [],
//     FloorLevels: [],
//     Garages: {Min: { type: String},Max: {type: String}},
//     Carports: { Min: { type: String }, Max: {type: String}},
//     PrivatePool: {
//         type: String,
//         enum: ["Yes", "No", "Any"]
//     },
//     Price: { Min: { type: String }, Max:{ type: String } },
//     Year: { Min: { type: String }, Max: { type: String } },
//     GLA_SF: { Min: { type: String }, Max: { type: String } },
//     Beds: { Min: { type: String }, Max: { type: String } },
//     Baths: { Min: { type: String }, Max: { type: String } },
//     Acreage: { Min: { type: String }, Max: { type: String } },
//     ExteriorConstruction: [],
//     PublicRemarksKeywords: [],
//     PrivateRemarksKeywords: [],

// });

// const criteriaListingModel = model("criteriaListing",ListingSchema);
// export default criteriaListingModel;


import { Schema, model } from "mongoose";

const ListingFilterSchema = new Schema({

  filtername: {
    type: String,
  },
  filterpagepath: {
    type: String,
    default: "/criteria/listing"
  },
  Platformuser: {
    type: String,
    enum: ["admin", "user"],
    require: true
  },
  userid: {
    type: Schema.Types.ObjectId,
    refPath: "Platformuser",
  },
  marketStatus: {
    sold: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
    offMarket: { type: Boolean, default: false },
    daysBack: Number
  },

  propertyType: {
    singleFamily: { type: Boolean, default: false },
    condo: { type: Boolean, default: false },
    townhouse: { type: Boolean, default: false },
    villa: { type: Boolean, default: false }
  },

  floorLevels: {
    multisplit: { type: Boolean, default: false },
    one: { type: Boolean, default: false },
    two: { type: Boolean, default: false },
    threePlus: { type: Boolean, default: false }
  },

  garages: {
    min: Number,
    max: Number
  },

  carports: {
    min: Number,
    max: Number
  },

  privatePool: String,

  price: { min: Number, max: Number },
  year: { min: Number, max: Number },
  gla: { min: Number, max: Number },
  beds: { min: Number, max: Number },
  baths: { min: Number, max: Number },
  acreage: { min: Number, max: Number },

  exterior: {
    block: { type: Boolean, default: false },
    brick: { type: Boolean, default: false },
    concrete: { type: Boolean, default: false },
    stone: { type: Boolean, default: false },
    stucco: { type: Boolean, default: false },
    woodFrame: { type: Boolean, default: false },
    woodSiding: { type: Boolean, default: false }
  },

  publicKeywords: [String],
  privateKeywords: [String],


}, { timestamps: true });
const ListingFilterModel = model("ListingFilter", ListingFilterSchema)
export default ListingFilterModel;