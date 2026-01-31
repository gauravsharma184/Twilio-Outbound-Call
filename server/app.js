

const express = require('express');

const cors = require('cors');

const { createCallHandler, statusCallbackEventHandler, endcallHandler,validPhoneNumberHandler,eventHandler } = require('./controllers');

const app = express();

const PORT = 3000;

const bodyParser = require('body-parser')

const path = require('path');











app.use(cors());

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'../client')));

app.get('/',(req, res) => {
    return res.sendFile(path.join(__dirname,'../client','caller.html'));
})


app.get('/events',eventHandler)

app.get('/webhook', statusCallbackEventHandler);






app.post('/makecall',validPhoneNumberHandler, createCallHandler);


app.put('/endcall',endcallHandler)




















app.listen(PORT, () => console.log('server running at 3000'));






