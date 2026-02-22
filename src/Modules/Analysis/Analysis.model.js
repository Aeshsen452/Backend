import { Schema,model } from "mongoose";

const AnalysisSchema = new Schema({
  Platformuser: {
    type: String,
    enum: ["admin", "user"],
    require: true
  },
  userid: {
    type: Schema.Types.ObjectId,
    refPath: "Platformuser",
    required:true
  },
  AnalysisResults:
    {type:Schema.Types.ObjectId,
        ref:"listingMls",
        require:true
    }

},{timestamps:true});


const analysismodel = model("Analysis",AnalysisSchema);

export default  analysismodel;