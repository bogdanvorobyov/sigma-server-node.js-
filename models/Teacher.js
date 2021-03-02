const {Schema, model} = require("mongoose")

const Teacher = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    course:{type: String, required: true},
    cathedra:{type: String, required: true},
})


module.exports = model('Teacher', Teacher )