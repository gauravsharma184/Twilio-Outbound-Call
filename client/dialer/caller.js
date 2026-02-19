






const input = document.querySelector("#phone");
const alertBox = document.querySelector('.alert');
const makeCall = document.getElementById('MakeCall');
const makeCallBox = document.querySelector('.function_make_call');
const endCall = document.getElementById('EndCall');
const holdCall = document.getElementById('Hold');
const muteCall = document.getElementById('Mute');
const callLogs = document.getElementById('callLogs');
const endCallBox = document.querySelector('.function_end_call');




let timerInterval;
let sid;
let token;
let device;
let call;
let holdFlag = true;
let childCallSid;
let conferenceSid;



const iti = window.intlTelInput(input, {
  initialCountry: "us",
  
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});


function showAlert(message, type='info'){
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    
    alertBox.textContent = message;
    
}

function updateTime(startTime){
    let total_time = Date.now() - startTime;
    
    let total_sec = Math.floor(total_time/1000);
    let miniutes = Math.floor(total_sec/60);
    let seconds =  Math.floor(total_sec%60);
    let min = miniutes.toString();
    let sec = seconds.toString();
    showAlert(`${min.padStart(2,'0')}:${sec.padStart(2,'0')}`,'success');

}


const expression = /\D/;
const reg = new RegExp(expression);


input.addEventListener('keypress', (event) => {
    

    // console.log(event.key);

    const check = reg.test(event.key);

    if(event.key != null && check){
        event.preventDefault();
        showAlert('please enter a digit','error');
    }

    else alertBox.style.display = 'none';



    

    

    

})

async function getToken(){
    try{
        const tokenEndPoint = 'http://localhost:3000/token';
        const tokenOptions = {
            method:'GET'
        }

        const res = await fetch(tokenEndPoint,tokenOptions);

        if(!res.ok){
            throw new Error(`Error http status ${res.status}`);
        }

        const data = await res.json();
        token = data.token;
        const options = {
            closeProtection: true,
            debug:true
        }
        device = new Twilio.Device(token, options);
        console.log(device);
        

    } catch(err){
        console.log(err);
    }

    

}


makeCall.addEventListener('click', async () => {
    childCallSid = undefined;
    conferenceSid = undefined;
    alertBox.style.display = 'none';
    makeCall.disabled = true;
    const phoneNumber = iti.getNumber();
    console.log("phoneNumber",phoneNumber);
    const eventSource = new EventSource('http://localhost:3000/sendevents');
    
try{
    
    if(!phoneNumber){
        throw 'please enter a number';
    }

    
    

     

    const options = {
        params:{
            To: phoneNumber
        }
    }

    call = await device.connect(options); //twilio hits my voice endpoint with the parameters //this is the parent call that I make to twilio

    console.log(call);


    eventSource.onmessage = function(event) {
        
        console.log(event);

        const data = JSON.parse(event.data);
        console.log(data);
        console.log(data.status);

        if(data.status === 'queued'){
            conferenceSid = data.conferenceSid;
            console.log("conferenceSid",conferenceSid)
            return;
        }
        
        if(data.status === 'ringing'){
            //show alert to the client

            showAlert('ringing','success');
            childCallSid = data.childCallSid;

            //show the endcall box and hide the make call box
            endCallBox.style.display = 'block';
            makeCall.style.display = 'none';
        }

        else if(data.status === 'in-progress'){
            holdCall.disabled = false;
            let startTime = Date.now();
            
            timerInterval = setInterval(updateTime,1000,startTime);

        }

        else if(data.status === 'completed'){
            alertBox.style.display = 'none';
            clearInterval(timerInterval); // clear the interval when the status is completed

            //make the make call button able and the hold call button disabled
            makeCall.disabled = false;
            holdCall.disabled=true;
            endCall.disabled = false;

            //make the endcallbox display to none

            endCallBox.style.display = 'none';
            makeCall.style.display = 'block';

           //closing the connection

           eventSource.close();

            
        }

        else{
            
            clearInterval(timerInterval); // clear the interval when the status is completed
            showAlert(data.status,'error');

            //make the make call button able and the hold call button disabled
            makeCall.disabled = false;
            holdCall.disabled=true;
            endCall.disabled = false;


            //make the endcallbox display to none and show the make call

            endCallBox.style.display = 'none';
            makeCall.style.display = 'block';

            //closing the connection

            eventSource.close();


            
        }
            
    }
    
    



    

} catch(err){
   showAlert(err,'error');
   makeCall.disabled=false;
}


    
})



endCall.addEventListener('click', async () => {
    console.log('endcall was clicked');
    endCall.disabled = true;

    try{
        await device.disconnectAll();
       
        
    } catch(err){
        console.log(err);
    }
})

holdCall.addEventListener('click',async (event) => {
    try{
        const holdEndPoint = 'http://localhost:3000/hold';
        const options = {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({
                flag: holdFlag,
                childCallSid: childCallSid,
                conferenceSid:conferenceSid

            })
        }

        const res = await fetch(holdEndPoint,options);

        if(!res.ok){
            throw new Error(`Error http status ${res.status}`);
        }
        
        const data = await res.json();

        if(data.hold === 'successful'){
            
            if(holdFlag){
                holdCall.textContent = 'resume';
            }

            else holdCall.textContent = 'hold';

            holdFlag = !(holdFlag);

        }
    } catch(err){
        console.log(err);
    }



})


callLogs.addEventListener('click',() => {
    window.location.href = 'http://localhost:3000/logs';
})


// window.addEventListener("beforeunload", (event) => {
//     console.log(event);
//     if(call){
//         event.preventDefault();
        
//     }
// })



getToken()