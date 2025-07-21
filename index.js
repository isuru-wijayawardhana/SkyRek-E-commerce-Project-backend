import express from "express";
import mongoose, { Mongoose } from "mongoose";
import bodyParser from "body-parser";
import userRouter from "./routers/userRouter.js";
import jwt from "jsonwebtoken"
import productRouter from "./routers/productRouter.js";

let app = express();

app.use(bodyParser.json()) //middle ware

app.use(
    (req,res,next)=>{
        const value = req.header("Authorization")
        if(value){
            const token = value.replace("Bearer ","")
            //console.log(token)
            jwt.verify(
                token,
                "abcd123",
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


let connectionString = "mongodb+srv://admin123:123@cluster0.4eqmsdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


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