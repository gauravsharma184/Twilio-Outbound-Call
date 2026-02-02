const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    max: 20
})


const bcrypt = require('bcrypt');
const saltRounds = 10;


async function checkUnique(email) {
    try{
        const client = await pool.connect();

        const query = 'SELECT COUNT(*) AS COUNT FROM users WHERE email_id = $1';

        const values = [email];

        const result = await client.query(query, values);

        client.release();

        const numberOfRows = Number(result.rows[0].count);
        // console.log(result);
        console.log(numberOfRows);

        return numberOfRows === 0;

        

        


    } catch(err) {
        console.log(err);
    }
}


async function insertUser(email, password){
    try{
        const client = await pool.connect();
        

        const query = `
            INSERT INTO users(email_id, password)
            VALUES($1, $2);
        
        `;

        const hash = await bcrypt.hash(password,saltRounds);
        const values = [email, hash];
        const result = await client.query(query, values);
        client.release();
    } catch(err){
        console.log(err);
    }
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


async function getUserId(email){
    try{
        const client = await pool.connect();
        const query = 'SELECT user_id FROM users WHERE email_id = $1';
        const values = [email];
        const result = await client.query(query, values)

        console.log(result);

        return result.rows[0].user_id;

        client.release();
    } catch(err){
        console.log(err);
    }
}


module.exports = {
    checkUnique,
    insertUser,
    isValidCredentials,
    getUserId
}


