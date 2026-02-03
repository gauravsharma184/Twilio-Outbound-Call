const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alertBox = document.querySelector('.alert');
const signUpButton = document.getElementById('Signup');



function showAlert(message, type='info'){
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    
    alertBox.textContent = message;
    
}



const signUpListener = async (event) => {
    signUpButton.disabled = true;

    try{
        const email = emailInput.value;
        const password = passwordInput.value;
        const newUser = {
            Email:email,
            Password:password
        }

        const res = await fetch('http://localhost:3000/createaccount',{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        })

        const response = await res.json(); // I got a response object

        console.log(response);

        showAlert(response.message);

        signUpButton.disabled = false;

        
    } catch(err){
        showAlert(err,'error');
    }




    

}




signUpButton.addEventListener('click',signUpListener);






