const Router = require('express')
const config = require("config")
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const router = new Router()
const {check, validationResult} = require("express-validator")
const jwt = require("jsonwebtoken")
const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const Group = require('../models/Group')
const Cathedra = require('../models/Cathedra')
const Course = require('../models/Course')
const authMiddleware = require('../middleware/auth.middleware')




router.post('/registration',
[
    check('email', "Uncorrect email").isEmail(),
    check('password', "Password must be longer than 8 and shorter than 20 symbols").isLength({min:8,max:20}),
    check('name', "Name shoud not be ampty").isLength({min:1}),
],
async (req, res) =>{ 
    try{
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
        
        const {email, password, name, course, group, cathedra,status} = req.body; 

        const errors = validationResult(req); 
        if (!errors.isEmpty()){ 
            return res.status(400).json({message: 'Uncorrect request', errors})
        }
        

        const candidate = await User.findOne({email})
        if(candidate) { 
            return res.status(400).json({message: `User with email ${email} already exist`})
        }
        const hashPassword = await bcrypt.hash(password,8)
        const user = new User({email, password:hashPassword, name,status})

        if(status === 'student'){
        const student = new Student({email, password:hashPassword, name, course, group})
        await student.save()
            if (!await Group.findOne({name:group})){ 
                const groups = new Group({name:group, students: {name:name, email: email}, courses:course})
                await groups.save()
            }
            else{ 
                if(!await Group.findOne({"students.name": name})){
                    await Group.updateOne({$push:{"students": {name:name, email: email}}})
                }
                if(!await Group.findOne({courses:course})){ 
                    await Group.updateOne({$push:{"courses": course}})
                }
            }
        }
        else{
            
            const teacher = new Teacher({email, password:hashPassword, name, course, cathedra})
            await teacher.save()
                if (!await Cathedra.findOne({name:cathedra})){ 

                    const cathedras = new Cathedra({name:cathedra, teachers: {name:name, email: email}, courses:course})
                    await cathedras.save()
                }
                else{ 
                    if(!await Cathedra.findOne({"teachers.name": name})){
                        await Cathedra.updateOne({$push:{"teachers": {name:name, email: email}}})
                    }
                    if(!await Cathedra.findOne({courses:course})){ 
                        await Cathedra.updateOne({$push:{"courses": course}})
                    }
                }
            }
        if(!await Course.findOne({name:course})){
            if (status==='student'){
                const courses = new Course({name:course, students:{name:name, email: email}, groups:group, cathedras: cathedra})
                await courses.save()
            }
            else { 
                const courses = new Course({name:course, teachers:{name:name, email: email}, groups:group, })
                await courses.save()
            }
        }
        else{ 
            if(!await Course.findOne({name:course,"students.name": name})&&status==='student'){
                await Course.updateOne({name:course},{$push:{"students": {name:name, email: email}}})
            }
            if(!await Course.findOne({name:course,"teachers.name": name})&&status==='teacher'){
                await Course.updateOne({name:course},{$push:{"teachers": {name:name, email: email}}})
            }
            if(!await Course.findOne({name:course,groups:group})&&status==='student'){ 
                await Course.updateOne({name:course},{$push:{"groups": group}})
            }
            if(!await Course.findOne({name:course,cathedras:cathedra})&&status==='teacher'){ 
                await Course.updateOne({name:course},{$push:{"cathedras": cathedra}})
            }
        }

        await user.save()
        

        return res.json({message: `User ${email} was created`})
    }
    catch (e){ 
        console.log(e)
        res.send({message: "Server error"})
    }

})

router.post('/login',

async (req, res) =>{ 
    try{
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
       const {email, password} = req.body; 
       const user = await User.findOne({email})
       if(!user){ 
            return res.status(400).json({message:"User isn't found"})
       }
       const isPassValid = bcrypt.compareSync(password, user.password)
       if(!isPassValid){ 
         return res.status(400).json({message:"Invalid password"})
       }
       const token = jwt.sign({id:user.id},config.get("secretKey"), {expiresIn: '1h'})

       
       const student  = await Student.findOne({email})
            const teacher  = await Teacher.findOne({email})
    
            if (student){ 
                    const  result = {
                    id: student.id,
                    email: student.email,
                    name:student.name,
                    course: student.course,
                    group: student.group
                }
                return res.json({
                    user:{
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    status: 'student',
                    student: result, 
                }
                })
            }
            else{ 
                const result2 = {
                id: teacher.id,
                email: teacher.email,
                name:teacher.name,
                course: teacher.course,
                cathedra: teacher.cathedra
            }
            return res.json({
                user:{
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                status: "teacher", 
                teacher: result2
            }
            })
        }
    }
    catch (e){ 
        console.log(e)
        res.send({message: "Server error"})
    }

})

router.get('/auth', authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
            const email = user.email
            const student  = await Student.findOne({email})
            const teacher  = await Teacher.findOne({email})
        
            if (student){ 
                    const  result = {
                    id: student.id,
                    email: student.email,
                    name:student.name,
                    course: student.course,
                    group: student.group
                }
                return res.json({
                    user:{
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    status: 'student',
                    student: result, 
                }
                })
            }

            else{ 
                    const result2 = {
                    id: teacher.id,
                    email: teacher.email,
                    name:teacher.name,
                    course: teacher.course,
                    cathedra: teacher.cathedra
                }
                return res.json({
                    user:{
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                    status: 'teacher', 
                    teacher: result2
                }
                })
            }
            
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    })

module.exports = router; 

