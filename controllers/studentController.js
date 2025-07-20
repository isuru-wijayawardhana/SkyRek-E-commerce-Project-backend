import Student from "../models/student.js"

// export function getStudents(req,res){
//     Student.find()
//         .then(
//             (students)=>{
//                 res.json(students)
//             }
//         ).catch(
//             ()=>{
//                 res.json({
//                     message : "Faild to fetch students",
//                 })
//             })

// }

export async function getStudents(req,res) {
    try{
        const students = await Student.find()
        res.json(students)
    }catch{
        res.status(500).json({
            message : "Faild to fetch students",
            error: error.message
        })
    }
    
}

export function saveStudent(req,res){
    const student = new Student( //create student object can be save
        {
            name : req.body.name,
            age : req.body.age,
            email : req.body.email
        }
    )

    student.save().then(
        ()=>{
            res.json(
                {
                    message : "student create succesful"
                }
            )
        }
    ).catch(
        ()=>{
            console.log("Faild to save studet")
        }
    )
}