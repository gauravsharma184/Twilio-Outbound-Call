const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    max: 20
})



async function insertCallDB(sid, to, status, id){
    try{

        const client = await pool.connect();
        const query = `
        
            INSERT INTO CALL_LOGS(SID,OUTBOUND_NUMBER,STATUS,user_id)
            VALUES($1, $2, $3,$4);
        
        
        
        `;

        const values = [sid, to, status, id];

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


async function getCallLogs(user_id){
    try{

        const client = await pool.connect();
        const query = `
        
            SELECT SID,OUTBOUND_NUMBER,STATUS,CALL_TIMESTAMP,DURATION FROM CALL_LOGS WHERE user_id = $1;
        
        
        `;

        const values = [user_id];

        const result = await client.query(query, values);



        client.release();

        // console.log(result);

        return result.rows;

        
        

    } catch(err){
        console.log(err);
    }
}


async function getUserIdFromDataBase(sid){
    try{

        const client = await pool.connect();
        const query = `
        
            SELECT user_id FROM CALL_LOGS WHERE SID = $1;
        
        
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
    getSidDB,
    getCallLogs,
    getUserIdFromDataBase
}








