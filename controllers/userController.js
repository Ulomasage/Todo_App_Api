const UserModel = require('../models/userModel');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
// const sendMail=require("../helpers/email")
const {signUpTemplate,verifyTemplate}=require("../helpers/html")
const fs = require('fs');


exports.signUp = async (req, res) => {
    try {
        const {fullname,email,password} = req.body;
        if(!fullname || !email || !password){
            return res.status(400).json({message:"kindly enter all details"})
        };
        const existingUser = await UserModel.findOne({email})
        if(existingUser){
        return res.status(400).json({message:"user already exist"})
         }else{
        const saltedPassword = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,saltedPassword)
         
        
         const user = new UserModel({
            fullname,
            email:email.toLowerCase(),
            password:hashedPassword
          
        })
        // const userToken = jwt.sign(
        //     { id: user._id, email: user.email },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "10 Minutes" }
        // );
        // const verifyLink = `${req.protocol}://${req.get(
        //     "host"
        // )}/api/v1/user/verify/${userToken}`;

        await user.save();
        // await sendMail({
        //     subject: `Kindly Verify your mail`,
        //     email: user.email,
        //     html: signUpTemplate(verifyLink, user.fullname),
        // });
        res.status(201).json({
            status:'created successfully',
            message: `Welcome ${user.fullname} to your todo list, kindly check your mail to access your link to verify your email`,
            data: user,
        });
    }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
exports.logIn = async(req,res)=>{
    try {
       const {email,password}=req.body
       
       const existingUser = await UserModel.findOne({email:email.toLowerCase()})
       if(!existingUser){
       return res.status(404).json({message:"user not found"})
       }

       const confirmPassword = await bcrypt.compare(password,existingUser.password)
       if(!confirmPassword){
        return res.status(400).json({message:"incorrect password"})
        }
        const token = await jwt.sign({userId:existingUser._id, email:existingUser.email, isAdmin: existingUser.isAdmin},process.env.JWT_SECRET,{expiresIn:"1h"})
        res.status(200).json({
            message:"login successful", data:existingUser, token
           })

    } catch (error) {
        res.status(500).json(error.message)
    }
}

exports.makeAdmin = async(req,res)=>{
    try {
        const {userId} = req.params
        const user = await UserModel.findById(userId)
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        user.isAdmin = true
        await user.save()
        res.status(200).json({
            message:"user now an admin", data:user
           })
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.verifyEmail = async(req,res)=>{
    try {
       const {token} = req.params
       const {email}=jwt.verify(token,process.env.JWT_SECRET) 
       const user = await UserModel.findOne({email})
       if(!user){
        return res.status(404).json({message:"user not found"})
        }

        if(user.isVerified){
            return res.status(400).json({message:"user already verified"})
            }
        user.isVerified=true
        await user.save()

        res.status(200).json({
            message:"user verification successful", data:user
           })

    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError){
            return res.status(400).json({message:"link expired"})
        }
        res.status(500).json(error.message) 
    }
}

exports.resendVerification = async(req,res)=>{
    try {
        const {email} = req.body
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({message:"user does not exist"})
        }    
        
        if(user.isVerified){
            return res.status(400).json({message:"user already verified"})
            }
        const token = await jwt.sign({userId:user._id, userEmail:user.email},process.env.JWT_SECRET,{expiresIn:"20mins"})  
        const verifyLink=`${req.protocol}://${req.get("host")}/api/v1/user/verify/${user._id}/${token}`   
        let mailOptions={
            email:user.email,
            subject:"verification email",
            html:verifyTemplate(verifyLink,user.fullname)
        }
       await sendMail(mailOptions)
        res.status(200).json({message:"verification link sent to your email"})
    } catch (error) {
        res.status(500).json(error.message) 
    }
}

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        // Extract the email from the request body
        const { email } = req.body;
        // Check if the email exists in the database
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Generate a reset token
        const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "30m" });

        // Send reset password email
        const mailOptions = {
            email: user.email,
            subject: "Password Reset",
            html: `Please click on the link to reset your password: <a href="${req.protocol}://${req.get("host")}/api/v1/user/reset-password/${resetToken}">Reset Password</a> link expires in 30 minutes`,
        };
        //   Send the email
        await sendMail(mailOptions);
        //   Send a success response
        res.status(200).json({
            message: "Password reset email sent successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user by ID
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Salt and hash the new password
        const saltedRound = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltedRound);
        // Update the user's password
        user.password = hashedPassword;
        // Save changes to the database
        await user.save();
        // Send a success response
        res.status(200).json({
            message: "Password reset successful"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, existingPassword } = req.body;
        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user by ID
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Confirm the previous password
        const isPasswordMatch = await bcrypt.compare(existingPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Existing password does not match"
            });
        }
        // Salt and hash the new password
        const saltedRound = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltedRound);
        // Update the user's password
        user.password = hashedPassword;
        // Save the changes to the database
        await user.save();
        //   Send a success response
        res.status(200).json({
            message: "Password changed successful"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


exports.getAllUsers = async(req,res)=>{
    try {
        const allusers = await UserModel.find()
        if(allusers.length <=0){
            return res.status(400).json({
                message:"No available registered users"
            })
        }
        res.status(200).json({
            message:'List of all users in the database',
            totalUsersRegistered:allusers.length,
            data:allusers
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}


exports.deleteUser = async(req,res)=>{
    try {
        const {userId} = req.params
        const user = await UserModel.findById(userId)
        if(!user){
            res.status(404).json({
                message:'User not found'
            })
           }

        const deletedUser = await UserModel.findByIdAndDelete(userId)
        res.status(200).json({
            message:'User deleted successfully',
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}


exports.getOneUser = async (req, res) => {
    try {
        const { userId } = req.params
        const oneUser = await UserModel.findOne(userId);
        if(!oneUser){
            return res.status(404).json({
                message: 'User not found'
            })
        }
        res.status(200).json({
            message: 'Below is the one user found',
            data: oneUser
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}