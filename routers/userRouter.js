import express from 'express'
import { createUser, getUser, googleLogin, loginUser, sendOTP,  } from '../controllers/userController.js'


const userRouter = express.Router()

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/",getUser)
userRouter.post("/google-login",googleLogin)
userRouter.post("/send-otp",sendOTP)

export default userRouter;