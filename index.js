const express = require("express");
const mongoose = require("mongoose");
const config = require ("config"); 
const authRouter = require('./routes/auth.routes')
const homeRouter = require('./routes/home.routes')
const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const corsMiddleware = require('./middleware/cors.middleware')

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

app.use(corsMiddleware)
app.use(express.static('static'))
app.use(express.json())
app.use('/api/auth', authRouter)
// app.use('/api/information', homeRouter)

const start = async () => { 
    try{ 
        await mongoose.connect(config.get('dbURL'))

        app.listen(PORT, ()=>{
            console.log('Server started on port', PORT)
        })
    }
    catch(e) { 

    }
}

start()