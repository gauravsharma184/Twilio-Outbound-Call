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

        if(!email || !password){
            throw 'please fill your credentials';
        }
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

        await fetch('http://localhost:3000/login',{ // if the account has been created we show the user the login page
            method: "GET",
        })

        signUpButton.disabled = false;

        
    } catch(err){
        showAlert(err,'error');
    }




    

}




signUpButton.addEventListener('click',signUpListener);






