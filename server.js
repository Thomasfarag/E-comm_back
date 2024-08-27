import express from 'express'
import dotenv from "dotenv"
import dbConnection from './databases/dbConnection.js'
dotenv.config()
import morgan from 'morgan'
import { init } from './src/modules/index.js'
import cors from 'cors';
import compression from 'compression'

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 4000
app.use(cors());
app.use(compression());
app.use(express.static("uploads"))

app.use(morgan('dev'))

init(app)
dbConnection()
app.listen( port || process.env.PORT  , () => console.log(`Example app listening on port ${port}!`))


process.on('unhandledRejection', (err) => {
    console.log(err);
})
// statusCodes 500 ... 200