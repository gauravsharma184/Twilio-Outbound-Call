const VoiceResponse = require('twilio').twiml.VoiceResponse;


const response = new VoiceResponse();
response.dial('+918527278805');
response.say('Goodbye');

console.log(response.toString());