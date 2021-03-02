const {Schema, model} = require("mongoose")

const Group = new Schema({
    name:{type: String, required: true},
    students: {type: Array, required: true}, 
    courses: {type: Array, required: true}, 
})


module.exports = model('Group', Group)