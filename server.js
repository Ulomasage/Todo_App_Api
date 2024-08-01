require('./config/dbConfig.js')
const express = require('express')
require("dotenv").config()
const cors = require('cors')
const morgan = require('morgan')
const PORT=process.env.PORT || 5050
const userRouter = require('./routers/userRouter.js')
const todoRouter = require('./routers/todoRouter.js')

const app = express();
app.use(cors({origin: "*"}))

app.use(morgan("dev"))
app.use(express.json())

app.use("/api/v1/user",userRouter)
app.use("/api/v1",todoRouter)

app.listen(PORT, () => {
    console.log(`server running on PORT: ${PORT}`);
})