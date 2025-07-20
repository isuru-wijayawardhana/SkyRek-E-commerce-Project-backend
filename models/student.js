import mongoose from "mongoose"



const StudentSchema = new mongoose.Schema(
    {
        name : String,
        age : Number,
        email : String
    }
)

const Student = mongoose.model("student",StudentSchema) 

export default Student;