

const express = require('express');
require('dotenv').config();
const cors = require('cors');

const { createCallHandler, statusCallbackEventHandler, endcallHandler,validPhoneNumberHandler,eventHandler } = require('./controllers/call.js');

const {validEmailHandler,createAccountHandler,isValidCredentialsHandler,createJWTHandler,} = require('./controllers/authenticaton.js')

const app = express();

const PORT = 3000;

const bodyParser = require('body-parser')

const path = require('path');

const cookieParser = require('cookie-parser')












app.use(cors());
app.use(cookieParser(process.env.JWT_SYMMETRIC_KEY))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(path.join(__dirname,'../client/dialer')));
app.use(express.static(path.join(__dirname,'../client/login')));
app.use(express.static(path.join(__dirname,'../client/signup')))

console.log(__dirname);

app.get('/',(req, res) => {
    return res.sendFile(path.join(__dirname,'../client','/dialer/caller.html'));
})

app.get('/login',(req, res) => {
    return res.sendFile(path.join(__dirname,'../client','/login/login.html'));
})

app.get('/signup',(req, res) => {
    return res.sendFile(path.join(__dirname,'../client','/signup/signup.html'));
})


app.get('/events',eventHandler)

app.get('/webhook', statusCallbackEventHandler);






app.post('/makecall',validPhoneNumberHandler, createCallHandler);


app.put('/endcall',endcallHandler)


app.post('/createaccount',createAccountHandler);

app.post('/authenticate',isValidCredentialsHandler,createJWTHandler);






















app.listen(PORT, () => console.log('server running at 3000'));






