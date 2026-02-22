
import { Schema,model } from "mongoose";

const ScoringSchema = new Schema({
  filtername:{
    type:String,
  },
  filterpagepath:{
    type:String,
    default:"/criteria/scoring"
  },
  Platformuser:{
   type:String,
   enum:["admin","user"],
   require:true
  },
  userid:{
     type : Schema.Types.ObjectId,
         refPath : "Platformuser",
  },
  included: {
    PriceChanges: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String
    },
    Dom: {
       enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String
    },
    Vacant: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String
    },
    PercentPriceChange: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String
    },
    PublicKeyword: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String
    },
    Privatekeyword: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String
    },
    RealtorInfo: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String,
      options: []
    },
    FinanceAvailable: {
      enabled: {
        type:String,
        enum:["true","false"]
      },
      points: String,
      options: []
    }
  },
    Privatekeywords: [],
    Publickeywords: []

},{timestamps:true})

const criteriaScoringModel = model("criteriaScoring",ScoringSchema);
export default criteriaScoringModel;