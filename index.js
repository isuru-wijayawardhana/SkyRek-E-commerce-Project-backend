import express from "express";
import mongoose, { Mongoose } from "mongoose";
import bodyParser from "body-parser";
import userRouter from "./routers/userRouter.js";
import jwt from "jsonwebtoken"
import productRouter from "./routers/productRouter.js";
import dotenv from "dotenv"

dotenv.config()


let app = express();
app.use(cors) // API is accessible by any domains

app.use(bodyParser.json()) //middle ware

app.use(
    (req,res,next)=>{
        const value = req.header("Authorization")
        if(value){
            const token = value.replace("Bearer ","")
            //console.log(token)
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                (err,decoded)=>{
                    //console.log(decoded)
                    if(decoded == null){
                        res.status(403).json({
                            message : "unauthorized"
                        })
                    }else{
                        req.user = decoded
                        next()
                    }
                }
            )
        }else{
            next()
        }
        
        
    }
)


let connectionString = process.env.MONGODB_URL


mongoose.connect(connectionString).then(
    ()=>{
        console.log("Database Connected")
    }
).catch(
    ()=>{
        console.log("Failed to connect to Database")
    }
)


app.use("/api/users",userRouter)
app.use("/api/products",productRouter)

app.listen(5000 , ()=>{
    console.log("Server is running on port 5000") 
})






app.delete("/",()=>{
    console.log("This is delete request")
})