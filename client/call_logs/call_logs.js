const table = document.querySelector('#CallLogs');

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
    const tableHeaders = document.querySelector('#CallLogs thead tr');
    const tableBody = document.querySelector('#CallLogs tbody')
    const headers = Object.keys(data[0]);
    headers.push('action');
    console.log(headers);

    //created the column

    headers.forEach((head) => {
        const column = document.createElement('th');
        column.textContent = head;
        console.log(column);
        tableHeaders.appendChild(column);

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


table.addEventListener('click',({target}) => {
    const row = target.closest('tr');
    console.log(row);

    const cells = row.cells;

   

    const sid = cells[0].textContent;

    console.log(sid);

    
})





getData();