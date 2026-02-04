const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const { checkUnique, insertUser, getUserId, isValidCredentials } = require('../model/users');





const validEmailHandler = async (req, res, next) => {
    const email = req.body.Email;
    const secret = process.env.VERIFY_EMAIL_API_KEY;

    const params = new URLSearchParams();

    params.append('secret',secret);
    params.append('email',email);

    const queryString = params.toString();

    const baseURL = 'https://api.emaillistverify.com/api/verifyEmail'

    const finalURL = `${baseURL}?${queryString}`;

    try{

        const response = await axios.get(finalURL);

        console.log(response.data);

        if(response.data === 'ok'){
            next();
        }

        else return res.json({
            status: 'invalid email',
        })

    } catch(err){
        console.log(err);
        return res.status(400).send(err);
    }


    


}

const createAccountHandler = async (req, res, next) => {
    const email = req.body.Email;
    const password = req.body.Password;

    const checkForUniqueEmail = await checkUnique(email);

    if(checkForUniqueEmail){
        await insertUser(email,password);

        return res.json({
            message: 'Please Log In',
            

        })
    }


    return res.json({
        message:'User already exists'

    })

    
    // first signup will happen then the user will be redirected to the login page and when the 
    //user enters his email and password , we verify its credentials and then we create a jwt token and send him to the dialer


}




const createJWTHandler = async (req, res) => {
    const email = req.body.Email;
    const id = await getUserId(email);
    console.log(id);
    const payload = {};
    const key = process.env.JWT_SYMMETRIC_KEY;
    const config = {
        expiresIn : 60 * 60,
    }
     const token = jwt.sign(payload,key,config); //it should be synchronous

     res.cookie('access_token',token,{
        maxAge: 8 * 3600000,
        signed:true
    });

    res.cookie('id',id);

    res.json({
        status:'ok'
    })
   
        
}

const isValidCredentialsHandler = async (req, res, next) => {
    
    const email = req.body.Email;
    const password = req.body.Password;

    console.log(email);
    console.log(password);

    const isValid = await isValidCredentials(email,password);

    if(!isValid){
        return res.json({
            message: "Invalid Credentials",
            status:'error',
            flag: false
        })
    }


    next();
}


const verifyJWTtokenHandler = async(req, res, next) => {
    console.log(req.headers);
    const token = "" // will get from the front end
    jwt.verify(token,process.env.JWT_SYMMETRIC_KEY, function(err, decoded) {
        console.log(decoded);

        if(err){
            console.log(err);
        }
    })
}







module.exports = {
    validEmailHandler,
    createAccountHandler,
    createJWTHandler,
    isValidCredentialsHandler,
    verifyJWTtokenHandler
}


//created users table 






