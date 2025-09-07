import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import axios from "axios";
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import OTP from "../models/otp.js";
//import { text } from "body-parser";
dotenv.config()
const pass = process.env.GOOGLE_PASS
const transporter = nodemailer.createTransport({
    
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user:"kdemon1111@gmail.com",
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
        phone : req.body.phone,
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
                console.error("Error sending email:",error)
                res.status(500).json({message:"Failed to send OTP"})
            }else{
                console.log("Email sent",info.response)
                res.json({message: "OTP sent Successfully"})
            }
        })

    }catch{
        res.status(500).json({message: "Failed to delete previous OTPs"})
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