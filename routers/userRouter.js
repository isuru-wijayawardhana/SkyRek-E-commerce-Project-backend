import express from 'express'
import { contact, createUser, getUser, getUserDetails, getUserInfo, googleLogin, loginUser, resetPassword, sendOTP, updateUser, updateUserAdmin, verifyOTP, verifyUser, verifyUserOTP,  } from '../controllers/userController.js'


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
userRouter.put("/user-update/:email",updateUser)
userRouter.get("/get-user-details",getUserDetails)
userRouter.post("/verify-user",verifyUser)
userRouter.put("/verify-user-otp",verifyUserOTP)
export default userRouter;