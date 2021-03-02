const {Schema, model} = require("mongoose")

const Cathedra = new Schema({
    name:{type: String, required: true},
    teachers: {type: Array, required: true},
    courses: {type: Array, required: true},
})


module.exports = model('Cathedra', Cathedra)