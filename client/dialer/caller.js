






const input = document.querySelector("#phone");
const alertBox = document.querySelector('.alert');
const makeCall = document.getElementById('MakeCall');
const endCall = document.getElementById('EndCall');
const callLogs = document.getElementById('callLogs');




let timerInterval;
let sid;
let token;
let device;
let call;



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
    

    console.log(event.key);

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
        device = new Twilio.Device(token, {debug : true});
        console.log(device);
        

    } catch(err){
        console.log(err);
    }

    

}


makeCall.addEventListener('click', async () => {
    alertBox.style.display = 'none';
    makeCall.disabled = true;
    const phoneNumber = iti.getNumber();
    console.log(phoneNumber);
    console.log(typeof phoneNumber);
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
        if(event.data === 'ringing'){
            showAlert('ringing','success');
        }

        else if(event.data === 'in-progress'){
            let startTime = Date.now();
            
            timerInterval = setInterval(updateTime,1000,startTime);

            


        }

        else if(event.data === 'completed'){
            clearInterval(timerInterval);
            alertBox.style.display = 'none';
            makeCall.disabled = false;
            endCall.disabled = false;
            eventSource.close();
            
        }

        else{
            clearInterval(timerInterval);
            showAlert(event.data,'error');
            makeCall.disabled = false;
            endCall.disabled = false;
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
        endCall.disabled = false;
        makeCall.disabled = false;
    } catch(err){
        console.log(err);
    }
})


callLogs.addEventListener('click',() => {
    window.location.href = 'http://localhost:3000/logs';
})



getToken()












