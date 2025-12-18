import express from 'express'
import { contact, createUser, getUser, getUserInfo, googleLogin, loginUser, resetPassword, sendOTP, updateUserAdmin, verifyOTP,  } from '../controllers/userController.js'


const userRouter = express.Router()

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/",getUser)
userRouter.post("/google-login",googleLogin)
userRouter.post("/send-otp",sendOTP)
userRouter.post("/verify-otp",verifyOTP)
userRouter.post("/reset-password",resetPassword)
userRouter.post("/contact",contact)
userRouter.get("/getuserinfo/:page/:limit",getUserInfo)
userRouter.put("/update-user-admin/:email",updateUserAdmin)
export default userRouter;