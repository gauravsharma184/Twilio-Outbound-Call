const { response } = require('express');

require('dotenv').config();
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const bcrypt = require('bcrypt');
const saltRounds = 10;


// Used when generating any kind of tokens
// To set up environmental variables, see http://twil.io/secure
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;

let clients = [];

const generateTokenHandler = async (req, res) => {
    // Used specifically for creating Voice tokens
    const outgoingApplicationSid = process.env.TWIML_APP_SID;
    const identity = req.cookies.id;

    // Create a "grant" which enables a client to use Voice as a given user
    const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: outgoingApplicationSid,
    incomingAllow: true, // Optional: add to allow incoming calls
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    {identity: identity}
    );
    token.addGrant(voiceGrant);


    // console.log(token);

    // Serialize the token to a JWT string
    // console.log(token.toJwt());

    return res.json({
        token: token.toJwt(),
        identity: identity
    })
}


const getCallLogsHandler = async (req, res) => {
    console.log('Signed Cookies: ', req.signedCookies)

    const id = req.cookies.id;

    // console.log(id);

    const logs = await getCallLogs(id);

    return res.json(logs);
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

const eventHandler = (req, res) => {
    console.log(req); //data is in the body

    return res.send();
}


const sendEventsHandler = (req, res) => {
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


const callHandler = async (req, res) => {
    // creating a twilio response which will be sent to twilio when it hit my call handler end point when device.connect(params) is executed
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const callerId = process.env.TWILIO_PHONE_NUMBER;
    console.log(req);
    const phoneNumber = req.body.To;
    console.log(req.body);

    console.log(phoneNumber);

    const option = {
        statusCallbackEvent: 'completed',
        statusCallback: 'https://nominatively-atomistic-lacresha.ngrok-free.dev/events',
        statusCallbackMethod: 'POST'
    }


    



    if(phoneNumber){
        const response = new VoiceResponse();
        const dial = response.dial({
            
            callerId: callerId
        });
       
        dial.number(option,phoneNumber);
        res.set('Content-Type', 'text/xml');
        console.log(response.toString());
        res.send(response.toString());

        // console.log(response.toString());
    }

    
}



module.exports = {
    generateTokenHandler,
    getCallLogsHandler,
    deleteCallLogHandler,
    callHandler,
    eventHandler,
    sendEventsHandler
}