const input = document.querySelector("#phone");
const alertBox = document.querySelector('.alert');
const makeCall = document.getElementById('MakeCall');
const endCall = document.getElementById('EndCall');
const callLogs = document.getElementById('callLogs');
let timerInterval;
let sid;

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


makeCall.addEventListener('click', async (event) => {
    alertBox.style.display = 'none';
    makeCall.disabled = true;
    const phoneNumber = iti.getNumber();
    console.log(phoneNumber);
    console.log(typeof phoneNumber);
    const eventSource = new EventSource('http://localhost:3000/events');
try{
    
    if(!phoneNumber){
        throw 'please enter a number';
    }

    const res = await fetch('http://localhost:3000/makecall',{
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',

          },
        body: JSON.stringify({phoneNumber: phoneNumber})
    })

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


    



    

    const resp = await res.json();

    console.log(resp);

    sid = resp.callsid;

    console.log(sid);

   

    if(resp.error){
        throw resp.error;
    }

    


    



    

} catch(err){
    showAlert(err,'error');
    makeCall.disabled = false;
    endCall.disabled = false;
    eventSource.close();
}
    
})



endCall.addEventListener('click', async(event) => {


    try{

        console.log(sid);

        if(!sid){
            throw "no active call to end";
        }

        endCall.disabled = true;
        const res = await fetch('http://localhost:3000/endcall', {
            method: "PUT",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({callSid: sid})
        })

        const resp = await res.json();

        if(resp.error){
            throw resp.error;
        }

        sid=undefined;



    } catch(err){
        showAlert(err,'error');
        makeCall.disabled = false;
        endCall.disabled = false;
        
    }


})


callLogs.addEventListener('click',() => {
    window.location.href = 'http://localhost:3000/logs';
})
