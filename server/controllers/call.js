const {Device} = require('@twilio/voice-sdk');
require('dotenv').config();
const token = process.env.TWILIO_ACCESS_TOKEN;


const device = new Device(token);

// Make an outgoing call
async function makeOutgoingCall() {
    const call = await device.connect();
    console.log(call);

}

makeOutgoingCall();
  