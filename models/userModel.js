const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
   fullname: {
        type: String,
        required: true,
        trim:true
    },
    email:{
        type:String,
        required: true,
        trim:true,
        toLowerCase:true

    },
    password:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        default:false
     },
    isVerified:{
        type:Boolean,
        default:false
    },
    todo:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Todo"
    }]
}, {timestamps: true})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel
