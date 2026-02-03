const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alertBox = document.querySelector('.alert');
const logInButton = document.getElementById('LogIn');



function showAlert(message, type='info'){
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    
    alertBox.textContent = message;
    
}



const logInListener = async (event) => {
    logInButton.disabled = true;

    try{
        const email = emailInput.value;
        const password = passwordInput.value;
        const newUser = {
            Email:email,
            Password:password
        }

        const res = await fetch('http://localhost:3000/authenticate',{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        })

        const response = await res.json(); // I got a response object

        console.log(response);

        showAlert(response.message);

        logInButton.disabled = false;

        
    } catch(err){
        showAlert(err,'error');
    }




    

}




logInButton.addEventListener('click',logInListener);






