const { response } = require('express');

require('dotenv').config();
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const bcrypt = require('bcrypt');
const { insertParentCallDB, insertChildCallDB, updateCallDB, getUserIdFromDataBase, getCallSidAndConferenceSidfromDB } = require('../model/call_logs');
const saltRounds = 10;


// Used when generating any kind of tokens
// To set up environmental variables, see http://twil.io/secure
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilio = require('twilio');

const client = twilio(twilioAccountSid,authToken);

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

const eventHandler = async (req, res) => {

    // console.log(req.body);
    const data = req.body;
    // const parentCallSid = data.ParentCallSid;
    const direction = data.Direction;
    const childCallSid = data.CallSid;
    const status = data.CallStatus;
    const from = data.From;
    const to = data.To;
    const duration = data.CallDuration;
    //get the id from the db to send events to the client
    const user = await getUserIdFromDataBase(childCallSid);
    const userId = user.user_id;

    
    // const check = client.res;

    const event = {
        status: status,
        childCallSid:childCallSid
    }

    console.log(event);

    const eventJSON = JSON.stringify(event);

    
    const client = clients.find((client) => client.id == userId);
     if(client && client.res && status !== 'initiated'){
        console.log('sending event');
        client.res.write(`data:${eventJSON}\n\n`);
     }


    console.log(status);

    

    // if(status === 'initiated'){
    //     await insertChildCallDB(childCallSid,parentCallSid,status,from,to,duration,direction);
    // }

     if(status === 'completed'){
         await updateCallDB(childCallSid,status,duration);
    }
    else{
        await updateCallDB(childCallSid,status);
    }

    
    return res.send();
}


const sendEventsHandler = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');

    res.write('connected to the server\n\n');
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
    // console.log(req.body);
    const callerString = (req.body.Caller.split(':'));
    let idString = callerString[1];
    
    const idInt = Number(idString);
    const parentCallSid = req.body.CallSid;// what is this?? // this is the parent call sid of my inbound call to twilio
    console.log(parentCallSid);


    // await insertParentCallDB(parentCallSid,idInt);

    console.log(phoneNumber);


    

    

    

    //post request to add the callee to the to the conference

    const participant = await client
    .conferences(parentCallSid)
    .participants.create({
      
      
      from: callerId,
      
      statusCallback: "https://nominatively-atomistic-lacresha.ngrok-free.dev/events",
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      to: phoneNumber,
      endConferenceOnExit:true
    });

    // await insertChildCallDB(participant.callSid,parentCallSid);

    
    console.log(participant.conferenceSid);
    console.log(participant.callSid); //what is this?? // this is the sid of my outbound call// can use this to insert into my database

    //sending call sid to the user

    const event = {
        status: 'queued',
        childCallSid:participant.callSid,
        conferenceSid: participant.conferenceSid
    }

    const eventJSON = JSON.stringify(event);

    const user = clients.find((client) => client.id == idInt);
     if(user && user.res){
        console.log('sending event');
        user.res.write(`data:${eventJSON}\n\n`);
     }

    await insertChildCallDB(participant.callSid,parentCallSid,'queued',callerId,phoneNumber,0,'outbound',participant.conferenceSid,idInt);




    if(phoneNumber){
        const response = new VoiceResponse();
        const dial = response.dial({
            
            callerId: callerId
        });
       
        dial.conference({startConferenceOnEnter: true,endConferenceOnExit:true}, parentCallSid); 
        res.set('Content-Type', 'text/xml');
        console.log(response.toString());
        res.send(response.toString());

       
    }

    
}


const holdHandler = async(req, res) => {
    // a client will be available on a single call, hold should be available in-progress only can get the user id from the db
    // const result = await getCallSidAndConferenceSidfromDB(req.cookies.id);
    // console.log(result);

    console.log(req.body);
    const conferenceSid = req.body.conferenceSid;
    const childCallSid = req.body.childCallSid;

    if(req.body.flag){
        const participant = await client
        .conferences(conferenceSid)
        .participants(childCallSid)
        .update({
        hold: true,
        });

    }

    else{
        const participant = await client
        .conferences(conferenceSid)
        .participants(childCallSid)
        .update({
        hold: false,
        });
    }

    return res.json({
        hold: 'successful'
    })
}

const validPhoneNumberHandler = async (req, res, next) => {
    const number = req.body.To;
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



module.exports = {
    generateTokenHandler,
    getCallLogsHandler,
    deleteCallLogHandler,
    callHandler,
    eventHandler,
    sendEventsHandler,
    holdHandler,
    validPhoneNumberHandler
    
    
}