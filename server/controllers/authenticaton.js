const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');

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

const createAccountHandler = async (req, res) => {
    const email = req.body.Email;
    const password = req.body.Password;

    const checkForUniqueEmail = await checkUnique(email);

    if(checkForUniqueEmail){
        await insertUser(email,password);
    }

    return res.json({
        status: checkForUniqueEmail,
    })


}

async function isValidCredentials(email,password){
    try{
        const client = await pool.connect();
        const query = 'SELECT * FROM users WHERE email_id = $1';
        const values = [email];
        const result = await client.query(query, values)

        console.log(result);

        client.release();

        const hash = result.rows[0].password;

        console.log(hash);
        


        const isValid = bcrypt.compare(password,hash);

        return isValid;
    } catch(err){
        console.log(err);
    }
}




module.exports = {
    validEmailHandler,
    createAccountHandler,
    isValidCredentials
}






