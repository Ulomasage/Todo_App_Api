const express= require('express')
const { signUp, logIn, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword, deleteUser, getOneUser, getAllUsers } = require('../controllers/userController')
const { authenticate, isAdmin } = require('../middleware/authorization')

const router = express.Router()

router.post('/sign-up',signUp)
router.post("/login",logIn)
router.get("/login",getOneUser)
router.get("/login",authenticate,isAdmin,getAllUsers)
router.get("/verifyuser/:token",verifyEmail)
router.get("/reverify",resendVerification)
router.post('/forgot-password',forgotPassword);
router.post('/reset-password/:token',resetPassword);
router.post('/change-password/:token',changePassword);
router.delete("/remove-user/:userId",authenticate,isAdmin,deleteUser)

module.exports = router