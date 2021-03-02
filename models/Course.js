const {Schema, model} = require("mongoose")

const Course = new Schema({
    name: {type: String, required: true},
    students: {type: Array, required: true}, 
    teachers: {type: Array, required: true},
    groups: {type: Array, required: true}, 
    cathedras: {type: Array, required: true}, 
})


module.exports = model('Course', Course)