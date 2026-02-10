const table = document.querySelector('#CallLogs');
const tableHeaders = document.querySelector('#CallLogs thead tr');
const tableBody = document.querySelector('#CallLogs tbody')

async function getData(){
    try{
        const apiEndPoint = 'http://localhost:3000/callLogs';
        const options = {
            method: 'GET'
        }

        const res = await fetch(apiEndPoint, options);

        console.log(res);

        if(!res.ok){
            throw new Error(`HTTP status error ${res.status}`);
        }

        const data = await res.json();

        createTable(data);
    }catch(err){
        console.log(err);
    }


}


async function createTable(data){
    
    
   

    //created the column
    const headers = Object.keys(data[0]);
    console.log(headers);
    headers.push('action');
    headers.forEach((column) => {
        const header = document.createElement('th');
        header.textContent = column;
        tableHeaders.appendChild(header);
    })

    

    //inserting the rows
    data.forEach((obj) => {
        const row = document.createElement('tr');
        
        Object.values(obj).forEach((val) => {
            const cell = document.createElement('td');
            cell.textContent = val;
            row.appendChild(cell);
        })

        const button = document.createElement('button');
        button.textContent = 'delete';
        row.appendChild(button);

        tableBody.appendChild(row);
    })





    


    
}


const deleteCallLog = async (event) => {
    console.log(event);
    const button = event.target;
    const row = button.closest('tr');
    const sid = row.cells[0].textContent;
    tableBody.removeChild(row);
    const apiEndPoint =  'http://localhost:3000/api/deletecallLog';
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',

          },
        body: JSON.stringify({sid: sid})
    }

    

    const res = await fetch(apiEndPoint,options);

    const data = await res.json();
    console.log(data);
}


const listener = () => {
    const button = document.querySelectorAll('button');
    console.log(button);
    button.forEach((button) => {
        button.addEventListener('click',deleteCallLog);
    })
}


getData().then(listener);














