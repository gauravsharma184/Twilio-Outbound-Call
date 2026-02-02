require('dotenv').config();



const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
const ngrok = require("@ngrok/ngrok");


// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const bodyParser = require('body-parser');


const { insertCallDB, updateCallDB, getSidDB } = require('../model/call_logs.js');


const validPhoneNumberHandler = async (req, res, next) => {
    const number = req.body.phoneNumber;
    const phoneNumber = await client.lookups.v2
        .phoneNumbers(number)
        .fetch();



    if (!(phoneNumber.valid)) {
        return res.status(400).send({
            error: 'Invalid Number'
        })
    }

    next();
}

const createCallHandler = (req, res) => {
    const phoneNumber = req.body.phoneNumber;

    try {

        async function createCall() {
            const call = await client.calls.create({
                from: process.env.TWILIO_PHONE_NUMBER,

                statusCallback: "https://nominatively-atomistic-lacresha.ngrok-free.dev/webhook",
                statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
                statusCallbackMethod: "GET",
                to: phoneNumber,
                url: "http://demo.twilio.com/docs/voice.xml"
            });

            console.log(call.sid);
            console.log(call.status);

            return res.json({
                callsid: call.sid
            });
        }

        createCall();
    } catch (err) {
        console.log(err);

        return res.status(400).send({
            error: err
        })
    }




}

let clients = [];

const eventHandler = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('connected to the server');

    clients.push(res); // store the responses in the arrays

    req.on('close',() => {
        clients = clients.filter((client) => client !==  res);
        res.end();
    })



}





const statusCallbackEventHandler = async (req, res) => {

    
    const sid = req.query.CallSid;
    const status = req.query.CallStatus;
    const duration = req.query.CallDuration;
    const timestamp = req.query.Timestamp;
    const phoneNumber = req.query.To;

    console.log(status);
    console.log(sid);
    console.log(duration);
    console.log(timestamp);

    


    clients.forEach((client) => {
        // console.log(client);
        
        client.write(`data: ${status}\n\n`);
    })


    if (status === 'initiated') {

        await insertCallDB(sid, phoneNumber, status);


    }

    else await updateCallDB(sid, status, duration, timestamp);




    return res.send();


    
}


const endcallHandler = async (req, res) => {
    try {

        const sid = req.body.callSid;

        // console.log(sid);
        const result = await getSidDB(sid);

        // console.log(result);

        if (result.status === 'in-progress') {
            const call = await client
                .calls(sid)
                .update({ status: "completed" });
        }

        else {
            const call = await client
                .calls(sid)
                .update({ status: "canceled" });
        }

        return res.json({
            status: 'call ended successfully'
        })



    } catch (err) {
        console.log(err);
        return res.status(400).send({
            error: err
        })
    }






}





module.exports = {
    createCallHandler,
    statusCallbackEventHandler,
    endcallHandler,
    validPhoneNumberHandler,
    eventHandler
    
}

