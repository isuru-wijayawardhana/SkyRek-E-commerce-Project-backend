import express from "express";
import Student from "../models/student.js";
import { saveStudent, getStudents } from "../controllers/studentController.js";

const studentRouter = express.Router()


studentRouter.get("/",getStudents)

studentRouter.post("/",saveStudent)


export default studentRouter;