const {Schema, model} = require("mongoose")

const Student = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    course:{type: String, required: true},
    group:{type: String, required: true},
})


module.exports = model('Student', Student )