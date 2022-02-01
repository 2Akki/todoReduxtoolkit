const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types 
const todoSxhema= new mongoose.Schema({
    todo:{
        type: 'string',
        required: true
    },
    todoBy:{
        type:ObjectId,
        ref:"User"
    }
})
module.exports =mongoose.model("Todo",todoSxhema)