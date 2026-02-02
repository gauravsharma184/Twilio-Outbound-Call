const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const { checkUnique, insertUser } = require('../model/users');





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
    }

    else {
        return res.json({
            status:'user already exists'
        })
    }

    next();


}




const createJWTHandler = (req, res) => {
    const payload = {};
    const key = process.env.JWT_SYMMETRIC_KEY;
    const config = {
        expiresIn : 60 * 60,
    }
    jwt.sign(payload,key,config,function(err, token) {
        console.log(token);
    })
}







module.exports = {
    validEmailHandler,
    createAccountHandler,
    createJWTHandler
}


//created users table 






