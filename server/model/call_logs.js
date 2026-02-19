const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    max: 20
})



async function insertParentCallDB(sid,id){
    try{

        const client = await pool.connect();
        const query = `
        
            INSERT INTO parent_call(Parent_call_sid,User_id)
            VALUES($1, $2);
        
        
        
        `;

        const values = [sid,id];

        const result = await client.query(query, values);

        client.release();

    } catch(err){
        console.log(err);
    }
}


async function insertChildCallDB(child_sid,parent_sid,status,from,to,duration=0,direction=null,conferenceSid,user_id){
    try{

        const client = await pool.connect();
        const query = `
        
            INSERT INTO child_call(child_call_sid,parent_call_sid,status,direction,"From","To",duration,call_timestamp,user_id,conference_call_sid)
            VALUES($1, $2, $3, $4, $5, $6, $7, NOW(),$8,$9);
        
        
        
        `;

        const values = [child_sid,parent_sid,status,direction,from,to,duration,user_id,conferenceSid];

        const result = await client.query(query, values);

        client.release();

    } catch(err){
        console.log(err);
    }
}




async function updateCallDB(sid, status,duration = 0) {
    try{
        console.log(sid);
        const client = await pool.connect();
        const query = `
        
            UPDATE child_call
            SET status = $1, duration = $2
            WHERE child_call_sid = $3;
        
        
        
        `;

        const values = [status,duration,sid];

        const result = await client.query(query, values);

        // console.log(result.rows);

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
        
            SELECT SID,OUTBOUND_NUMBER,STATUS,CALL_TIMESTAMP,DURATION FROM CALL_LOGS
            WHERE user_id = $1 AND is_deleted = false
             ORDER BY call_timestamp DESC;
        
        
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
        
            SELECT user_id FROM child_call WHERE child_call_sid = $1;
        
        
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

async function deleteCallLogFromDB(sid){
    try{
        const client = await pool.connect();
        const query = `
        
            UPDATE CALL_LOGS 
            SET is_deleted = $1
            WHERE SID = $2;
        
        
        `;

        const values = [true,sid];

        const result = await client.query(query, values);



        client.release();

    } catch(err){
        console.log(err);
    }
}

async function getCallSidAndConferenceSidfromDB(user_id){
    try{
        const client = await pool.connect();
        const query = `
        
            SELECT child_call_sid,conference_call_sid
            FROM child_call
            WHERE user_id = $1 AND status = 'in-progress';
        
        
        `;

        const values = [user_id];

        const result = await client.query(query, values);

        return result.rows[0];



        client.release();

    } catch(err){
        console.log(err);
    }
}





module.exports = {
    insertChildCallDB,
    insertParentCallDB,
    updateCallDB,
    getSidDB,
    getCallLogs,
    getUserIdFromDataBase,
    deleteCallLogFromDB,
    getCallSidAndConferenceSidfromDB
}