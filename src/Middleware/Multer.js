import multer from "multer";

const storage = multer.diskStorage({
 destination : (req,file,cb)=>{
      if(file.fieldname === "profile"){
            cb(null,"public/images");    
    
      }
 },
 filename : (req,file,cb)=>{
    
    if(file.fieldname === "profile"){
        const date = Date.now();
        cb(null ,`profilepic-${date}-${file.originalname}`);    
      }
 }

})

const uploads = multer({storage});

  export default uploads;