const TodoModel = require('../models/todoModel')
const UserModel = require('../models/userModel')

exports.CreateContent = async(req,res)=>{
    try {
        const {userId}=req.user
        const {title, content}= req.body
        const user = await UserModel.findById(userId)
        if(!user){
            return res.status(404).json({
                message: ' user not found'
            })
        }
        const todo = new TodoModel({
            title,
            content
        })

        todo.user = userId
        user.todo.push(todo._id)
        await todo.save()
        await user.save()
        res.status(201).json({
            message: 'todo created succesfully',
            data:todo
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}

exports.getOneContent= async (req,res)=>{
    try {
        const {todoId}= req.params;
        const todo = await TodoModel.findOne(todoId)
        if(!todo){
            return res.status(404).json({
                message: 'not found'
            })
        }
        res.status(200).json({
            message:'content retrived successfully',
            data:todo
        })

    } catch (error) {
        res.status(500).json(error.message)
    }
}

exports.getAllContents = async(req,res)=>{
    try {
        const {userId} =req.user;
        const todos = await TodoModel.find({user:userId})
        res.status(200).json({
            message:'all content found',
            data:todos
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}

exports.updateContent = async(req,res)=>{
    try {
        const {userId} = req.user;
       const {todoId}= req.params;
       const {title, content}=req.body;
       const user = await UserModel.findByIdAndUpdate(userId)
        if(!user){
            return res.status(404).json({
                message: ' user not found'
            })
        }
       const todo = await TodoModel.findByIdAndUpdate(todoId)
       if(!todo){
        return res.status(500).json({
            message:'not found'
        })
       };
       if(todo.user.toString() !== userId.toString()){
       return res.status(401).json({
       message: 'user not allowed to update a content by another user'
       })
       }
       const data = {
        title: title||todo.title,
        content:content||todo.content
       }
       const updateContent = await TodoModel.findByIdAndUpdate(data)
       res.status(200).json({
        message:'updated successfully',
        data:updateContent
       })
    } catch (error) {
        res.status(500).json(error.message)
    }
}

exports.removeContent = async(req, res)=>{
    try {
       const {todoId}=req.params;
       const todo = await TodoModel.findById(todoId)
       if(!todo){
        res.status(404).json({
            message:'content not found'
        })
       }

       if(todo.user.toString() !== userId.toString()){
        return res.status(401).json({
        message: 'user not allowed to delete a content by another user'
        })
        }

       const deletedContent = await TodoModel.findByIdAndDelete(todoId)
       res.status(200).json({
        message:'deleted successfully',
       })
    } catch (error) {
        res.status(500).json(error.message)
    }
}