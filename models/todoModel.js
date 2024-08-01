const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim:true
    },
    content:{
        type:String,
        required: true
    },
    user:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
}, {timestamps: true})

const TodoModel = mongoose.model('Todo', TodoSchema);

module.exports = TodoModel
