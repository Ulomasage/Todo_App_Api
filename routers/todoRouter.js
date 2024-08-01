const express= require('express')
const { authenticate } = require('../middleware/authorization')
const { CreateContent, updateContent, removeContent, getAllContents, getOneContent } = require('../controllers/todoController')

const router = express.Router()

router.post('/create',authenticate,CreateContent)
router.get('/all-content',authenticate,getAllContents)
router.get('/one-content/:todoId',authenticate,getOneContent)
router.put('/update/:todoId',authenticate,updateContent)
router.delete('/delete-content/:todoId',authenticate,removeContent)

module.exports = router