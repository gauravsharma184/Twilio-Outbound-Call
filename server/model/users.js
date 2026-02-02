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

        if(numberOfRows === 0) return true;

        return false;

        

        


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


module.exports = {
    checkUnique,
    insertUser
}



