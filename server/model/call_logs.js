const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    max: 20
})



async function insertCallDB(sid, to, status){
    try{

        const client = await pool.connect();
        const query = `
        
            INSERT INTO CALL_LOGS(SID,OUTBOUND_NUMBER,STATUS)
            VALUES($1, $2, $3);
        
        
        
        `;

        const values = [sid, to, status];

        const result = await client.query(query, values);

        client.release();

    } catch(err){
        console.log(err);
    }
}


async function updateCallDB(sid, status,duration = null) {
    try{

        const client = await pool.connect();
        const query = `
        
            UPDATE CALL_LOGS 
            SET STATUS = $1, DURATION = $2, call_timestamp = NOW()
            WHERE SID = $3;
        
        
        
        `;

        const values = [status, duration, sid];

        const result = await client.query(query, values);

        client.release();

    } catch(err){
        console.log(err);
    }
}


async function getSidDB(sid) {
    try{

        const client = await pool.connect();
        const query = `
        
            SELECT STATUS FROM CALL_LOGS WHERE SID = $1;
        
        
        `;

        const values = [sid];

        const result = await client.query(query, values);



        client.release();

        // console.log(result);

        return result.rows[0];

        
        

    } catch(err){
        console.log(err);
    }
}





module.exports = {
    insertCallDB,
    updateCallDB,
    getSidDB
}








