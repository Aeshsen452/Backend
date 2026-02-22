import mongoose from "mongoose";

 const connectdb = async() =>{
  try {
     await mongoose.connect(process.env.Database_URI);
     console.log("Database connected successfully")
     
  } catch (error) {
    console.log(error)
  }
 }

 export default connectdb