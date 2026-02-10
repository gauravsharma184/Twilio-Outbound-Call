require('dotenv').config();



const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
const ngrok = require("@ngrok/ngrok");


// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const bodyParser = require('body-parser');


const { insertCallDB, updateCallDB, getSidDB, getCallLogs, getUserIdFromDataBase, deleteCallLogFromDB} = require('../model/call_logs.js');


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
    console.log(req.signedCookies);
    console.log(req.cookies);
    const id = req.cookies.id;

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
            await insertCallDB(call.sid, phoneNumber, call.status,id);

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
    const id = req.cookies.id;
    const client = {
        id:id,
        res:res
    }

    clients.push(client); // store the responses in the arrays

    req.on('close',() => {
        clients = clients.filter((client) => client.res !==  res);
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
    // console.log(sid);
    // console.log(duration);
    // console.log(timestamp);
    

    
    const user = await getUserIdFromDataBase(sid);
    const id = user.user_id;


    const client = clients.find((client) => client.id == id);
    client.res.write(`data: ${status}\n\n`);

    
    


    await updateCallDB(sid, status, duration);


   

   

        


    

     



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


const getCallLogsHandler = async (req, res) => {
    console.log('Signed Cookies: ', req.signedCookies)

    const id = req.cookies.id;

    // console.log(id);

    const logs = await getCallLogs(id);

    return res.json(logs);
}



const concurrentCallCheckerHandler = async (req, res) => {

}

const deleteCallLogHandler = async(req, res) => {
    try{
        const sid = req.body.sid;

        const result = await deleteCallLogFromDB(sid);

        return res.json({
            message: 'call log deleted successfully'
        })

    } catch(err){
        console.log(err);
    }    
}





module.exports = {
    createCallHandler,
    statusCallbackEventHandler,
    endcallHandler,
    validPhoneNumberHandler,
    eventHandler,
    getCallLogsHandler,
    deleteCallLogHandler
    
}

