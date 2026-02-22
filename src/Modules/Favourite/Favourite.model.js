import { Schema,model } from "mongoose";

const FavouriteSchema = new Schema({
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
  FavouriteResults:
    {type:Schema.Types.ObjectId,
        ref:"listingMls",
        require:true
    }

},{timestamps:true});


const favouritemodel = model("favourite",FavouriteSchema);

export default  favouritemodel;