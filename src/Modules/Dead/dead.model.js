import { Schema,model } from "mongoose";

const DeadSchema = new Schema({
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
  DeadResults:
    {type:Schema.Types.ObjectId,
        ref:"listingMls",
        require:true
    }

},{timestamps:true});


const Deadmodel = model("Dead",DeadSchema);

export default  Deadmodel;