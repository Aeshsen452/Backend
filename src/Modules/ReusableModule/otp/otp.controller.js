import nodemailer from "nodemailer";
import adminmodel from "../../admin/admin.model.js";
import otpValidationTime from "../../../Utils/otpValidationTime.js";
import jwt from "jsonwebtoken";



export const generateOtp = async (req, res) => {
    try {

        const email = req.body.email;

        if (!email) {
            req.status(404).json({ "status": 404, "success": false, "message": "Resource not found" });
        }

        const platformuser = await adminmodel.findOne({ email })
            //   || await providerModel.findOne({ email })
            ;

        if (!platformuser) {
            req.status(404).json({ "status": 404, "success": false, "message": "Resource not found" });
        }
        const OTP = Math.floor(Math.random() * 1000000);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Mail_Email,
                pass: process.env.Mail_App_Password
            }
        });

        //  if user found then this code will run 

        const mailOptions = {
            from: process.env.Mail_Email,
            to: email,
            subject: "Your OTP Code for Fil User Account - Secure Your Account",
            html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
              .email-container { background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 900px; margin: 0 auto; }
              .otp-code { font-size: 36px; font-weight: bold; color: #00aaff; text-align: center; }
              .message { font-size: 16px; color: #555; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>OTP Verification for Your FilterGoat User Account</h2>
              <p>Hello ${platformuser.name || platformuser.email},</p>
              <p>Thank you for being a part of FilterGoat! To verify your identity, please use the One-Time Password (OTP) below:</p>
              <div class="otp-code">${OTP}</div>
              <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this OTP, please ignore this email. Your account remains secure.</p>
              <p>If you have any questions, feel free to contact us at <a href="Info@Pairup.Com">support@FilterGoat.com</a>.</p>
            </div>
          </body>
        </html>
      `,
        };

        await transporter.sendMail(mailOptions);

        platformuser.otp = OTP;
        platformuser.otpCreated = Date.now();

        await platformuser.save();

        return res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": `Otp sent to ${email} successfully` });


    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);

    }


}

export const verifyOtp = async (req, res) => {
    try {
        const { email, OTP } = req.body;

        if (!email || !OTP) {
            return res.status(404).json({ "status": 404, "success": false, "message": "Resource not found" });
        }
        const verifyplatformuser = await adminmodel.findOne({ email })
            // ||await providerModel.findOne({ email }) 
            ;


        if (!verifyplatformuser) {
            return res.status(404).json({ "status": 404, "success": false, "message": "Resource not found" });
        }

        const Todaydate = new Date();

        const otpRequestDate = verifyplatformuser.otpCreated;

        const otpResult = otpValidationTime(otpRequestDate, Todaydate);

        if (!(otpResult === "Valid_Otp")) {
            return res.status(400).json({
                message: "OTP Expired please generate Another OTP"
            })
        }
        const OtpSavedUser = verifyplatformuser.otp;
        // return res.send(OtpSavedUser);
        if (!(OtpSavedUser === Number(OTP))) {
            return res.status(400).send("invalid OTP");
        }

        verifyplatformuser.otp = 0;
        verifyplatformuser.otpCreated = null;

        verifyplatformuser.save();

        const payload = verifyplatformuser.toObject();
         delete payload.password
         delete payload.otp
         delete payload.otpCreated

         const token = jwt.sign(payload,process.env.SECREATE_KEY);
         

        res.status(200).json({ "status": 200, "success": true, "message": "Request successful", "data": {token} });


    } catch (error) {
        res.status(500).json({ "status": 500, "success": false, "message": "Internal server error" });
        console.log(error);
    }
}