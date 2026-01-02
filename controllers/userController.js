import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import axios from "axios";
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import OTP from "../models/otp.js";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/// Define __filename and __dirname for ES Modules (sendMailFeedback function)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//import { text } from "body-parser";

dotenv.config()
const pass = process.env.GOOGLE_PASS
const transporter = nodemailer.createTransport({
    
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user:process.env.GMAIL_USER,
        pass:pass,
    },
})

export function createUser(req,res){
    
    const passwordHash = bcrypt.hashSync(req.body.password,10)

    const userData = {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : passwordHash,
    }
    
    const user = User(userData)
    


    user.save().then(
        ()=>{
            res.json({
                message : "User create successfully"
            })
        }
    ).catch(
        (err)=>{
            console.log(err)
            res.json({
                message : "Failed to create user"
            })
        }
    )
}

export function loginUser(req,res){

    const email = req.body.email
    const password = req.body.password

    User.findOne(
        {
            email : email
        }
    ).then(
        (user)=>{
            if(user == null){
                res.status(404).json({
                    message : "User Not Found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password,user.password)
                if(isPasswordCorrect){

                    const token = jwt.sign(
                        {
                            email : user.email,
                            firstName : user.firstName,
                            lastName : user.lastName,
                            role : user.role,
                            isBlock : user.isBlock,
                            isEmailVerified : user.isEmailVerified,
                            image : user.image
                        },
                        process.env.JWT_SECRET,
                    )

                    res.json({
                        message : "Login Successful",
                        token : token,
                        role : user.role,
                    })
                }else{
                    res.status(403).json({
                        message : "Incorrect password"
                    })
                }
            }
        }
    )
}

export function isAdmin (req){
    if(req.user == null){
        return false
    }
    if(req.user.role == "admin"){
        return true
    }else{
        return false
    }
}

export function getUser(req,res){
    if(req.user == null){
        res.status(404).json({
            message : "User not found"
        })
    }else{
        res.json(
            req.user
        )
    }
}

export async function googleLogin(req,res){
    const gooleToken = req.body.token

    try{
        const response = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers:{
                    Authorization: `Bearer ${gooleToken}`,
                },
            }
        )

        const user = await User.findOne({
            email: response.data.email,
        })

        if(user !=null){
            const token = jwt.sign(
                {
                    email : user.email,
                    firstName : user.firstName,
                    lastName : user.lastName,
                    role : user.role,
                    isBlock : user.isBlock,
                    isEmailVerified : user.isEmailVerified,
                    image : user.image                            
                },
                process.env.JWT_SECRET
            )
            res.json({
                token: token,
                message: "Login successful",
                role:user.role,

            })
        }else{
            const newUser = new User({
                email : response.data.email,
                firstName : response.data.given_name,
                lastName : response.data.family_name,
                role : "user",
                isBlock : false,
                isEmailVerified : true,
                image : response.data.picture,
                password : "123"  
            })
            await newUser.save()

            const token = jwt.sign(
                {
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    isBlocked: newUser.isBlocked,
                    isEmailVerified: newUser.isEmailVerified,
                    image: newUser.image,
                },
                process.env.JWT_SECRET
            );

            res.json({
                token: token,
                message: "User created successfully",
                role: newUser.role,
            });
        }
        

    }catch(error) {
        console.error("Error feching Google user info:",error)
        res.status(500).json({
            message: "Failed to authentication with Google"
        })
    }
}

export async function sendOTP(req,res) {
    const email = req.body.email
    //random number between 111111 and 999999
    const otpCode = Math.floor(10000 + Math.random() * 900000)
    try{
        //delete all otps from the mail
        await OTP.deleteMany({ email:email })
        //save new otp
        const newOTP = new OTP({email: email,otp:otpCode})
        await newOTP.save()

        //create message template
        const message = {
            from : "kdemon1111@gmail.com",
            to: email,
            subject: "Your OTP code",
            text: `Your OTP code is ${otpCode}`
        }
        transporter.sendMail(message,(error,info)=>{
            if(error){
                //console.error("Error sending email:",error)
                res.status(500).json({message:"Failed to send OTP"})
            }else{
                //console.log("Email sent",info.response)
                res.json({message: "OTP sent Successfully"})
            }
        })

    }catch{
        res.status(500).json({message: "Failed to delete previous OTPs"})
    }
    
}

export async function verifyOTP(req,res) {
    const email = req.body.email
    const otp = req.body.otp

    try {

        const otpRecord = await OTP.findOne({email:email,otp:otp})
        if(!otpRecord){
            return res.status(404).json({message:"Invalid OTP"})
        }

        const user = await User.findOne({email:email})
        if(!User){
            return res.status(400).json({ message: "User not found"})
        }

        res.json({message:"Valid otp entered Successfully"})

    } catch (error) {
        
        res.status(500).json({message:"Enter Valid otp"})
    }
}
export async function resetPassword(req,res) {
    const email = req.body.email
    const newPassword = req.body.newPassword
    const otp = req.body.otp

    try{
        const otpRecord = await OTP.findOne({email:email,otp:otp})
        if(!otpRecord){
            return res.status(404).json({message:"Invalid OTP"})
        }
        if(otp!=otpRecord.otp){
            return res.status(404).json({message:"Invalid OTP"})
        }
        const user = await User.findOne({email:email})
        if(!User){
            return res.status(400).json({ message: "User not found"})
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.updateOne({ email: email }, { password: hashedPassword });
        await OTP.deleteMany({ email: email });

        res.json({message:"Password reset Successfully"})
    }catch{
        res.status(500).json({message:"Failed to reset password"})
    }
}

async function sendMailFeedback(name,email){
    try{
    const Transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:process.env.GMAIL_USER,
            pass:process.env.GOOGLE_PASS
        }
    })

    const subject = 'Mail Regarding Feedback'
    const to = email
    const from = process.env.GMAIL_USER
    const template = Handlebars.compile(fs.readFileSync(path.join(__dirname,'templates','feedback.hbs'),'utf8'))
    const html = template({name:name})

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `Contact Form: ${subject} — ${name}`,
        html
    }

    const info = await transporter.sendMail(mailOptions,(error)=>{
        if(error){
            console.log('mail sent')
        }
    })
    } catch (err) {
    console.error("Feedback send failed:", err);
  }

}

export async function contact(req, res) {
  try {
    const { name, subject, email, message } = req.body;

    /// validate inputs
    if (!name || !subject || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    /// basic env checks
    if (!process.env.GMAIL_USER || !process.env.GOOGLE_PASS) {
      console.error("Missing GMAIL_USER or GMAIL_PASS in env");
      return res.status(500).json({ success: false, message: "Mail server not configured" });
    }
    //console.log("GMAIL_USER:", !!process.env.GMAIL_USER, "GMAIL_PASS:", !!process.env.GMAIL_PASS);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GOOGLE_PASS,
      },
      // optional: helpful when debugging TLS problems
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection config (useful for debugging)
    await transporter.verify();
    //transporter.verify().then(()=>console.log("Transporter OK")).catch(err=>console.error("Transporter verify failed",err));
    ///call sendmail funtion
    sendMailFeedback(name,email,message)

    const mailOptions = {
      from: email, // the user who filled the form
      to: process.env.GMAIL_USER || "kdemon1111@gmail.com",
      subject: `Contact Form: ${subject} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    //console.log("Contact email sent:", info.response);
    return res.json({ success: true, message: "Message sent successfully" });

  } catch (err) {
    console.error("Contact send failed:", err);
    // Do not leak sensitive info to client; return safe error
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
}

export async function getUserInfo(req,res) {

    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit) || 10

    if(req.user == null){
        res.status(401).json({ message: "Please login to view order"})
        return
    }

    try {
        if(isAdmin(req)){
            
            const userCount = await User.countDocuments()
            const totalPages = Math.ceil(userCount/limit)

            const users = await User.find().skip((page-1)*limit).limit(limit).sort({ firstName: -1})
            return res.json({
                users: users,
                totalPages: totalPages,
            })
        }else{
            return res.status(403).json({ message: "Access denied. Admins only"})
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Users",error})
        console.log(error)
    }
}

export async function updateUserAdmin(req,res) {
    

    if(isAdmin(req)){
        const email = req.params.email
        const role = req.body.role
        const isBlock = req.body.isBlock
        const loggedInEmail = req.user.email; 


        if (email === loggedInEmail) {
            return res.status(400).json({
                message: "Admin cannot update his own account"
        });
        }

        User.findOneAndUpdate(
            {email:email},
            {role:role,isBlock:isBlock}
            
        ).then(
            (updateUser=>{  
                if(updateUser){
                    res.json({
                        message:"User updated successfully",
                        user:updateUser,
                    })
                }else{
                    res.status(404).json({message:"User not found"})
                }
            })
        ).catch(
            (error)=>{
                console.error("Error updating User:",error)
                res.status(500).json({message:"Failed to update User"})
            }
        )
    }else{
        res.status(403).json({
			message : "You are not authorized to update User"
		})
    }
}

export async function updateUser(req,res) {
    
    try {

        if(req.user == null){
            return res.status(401).json({ message: "Please login" });
        }

        const email = req.params.email
        const userData = {}

        //Prevent user from updating another account
        if (req.user.email !== email) {
            return res.status(403).json({ message: "Unauthorized update attempt" });
        }

        if(req.body.password){
            userData.password=bcrypt.hashSync(req.body.password,10)
        }
        if(req.body.phone){
            userData.phone=req.body.phone
        }
        if(req.body.address){
            userData.address=req.body.address
        }
        if(req.body.image){
            userData.image=req.body.image
        }

        // Block forbidden fields explicitly
        if (req.body.email || req.body.role) {
            return res.status(403).json({
            message: "Email or role cannot be updated"
        });
        }

        if (Object.keys(userData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        await User.updateOne({
            email : email,
        },
        { $set: userData} //Using $set ensures that MongoDB only changes the fields you provide and leaves the other existing fields in the database exactly as they are.
        )

        res.json({ message: "user update successfully"})

    
    } catch (error) {
        console.error("Error update user:",error)
        return res.status(500).json({ message: "Failed to update user" })
    }
}

export async function getUserDetails(req,res) {
    try {
        if(req.user == null){
            return res.status(401).json({ message: "Please login" });
        }
        const email = req.user.email
        const user = await User.findOne({ email:email })
        res.json(user);

    } catch (error) {
        console.error("Get user info error:", error);
        res.status(500).json({ message: "Failed to get user info" });
    }
}

export async function verifyUser(req, res) {

  if (!req.user) {
    return res.status(401).json({ message: "Please login" });
  }
  const email = req.user.email;

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await OTP.deleteMany({ email: email });
    const newOTP = new OTP({ email: email, otp: otp });
    await newOTP.save();

    await sendMailVerifyUser(otp, email);

    return res.status(200).json({ message: "OTP sent successfully to " + email });

  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "An error occurred during verification" });
  }
}

async function sendMailVerifyUser(otp, email) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Fixed typo GMAIL_USE -> GMAIL_USER
        pass: process.env.GOOGLE_PASS
      }
    });

    const templatePath = path.join(__dirname, 'templates', 'userVerify.hbs');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template({ otp: otp });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Verify Your Account',
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    //console.log("Email sent: " + info.response);
    return true;

  } catch (err) {
    console.error("Nodemailer Error:", err);
    throw new Error("Email delivery failed"); 
  }
}
export async function verifyUserOTP(req,res) {
    const email = req.body.email
    const otp = req.body.otp

    try {

        const otpRecord = await OTP.findOne({email:email,otp:otp})
        if(!otpRecord){
            return res.status(404).json({message:"Invalid OTP"})
        }

        const user = await User.findOne({email:email})
        if(!User){
            return res.status(400).json({ message: "User not found"})
        }
        await User.findOneAndUpdate(
            {email:email},
            {isEmailVerified:"true"},
            {new:true}
        )

        res.json({message:"User Verified Successfully"})

    } catch (error) {
        
        res.status(500).json({message:"Enter Valid otp"})
    }
}