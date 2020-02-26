import { connection } from './init.js';

connection.onopen = event => {
	console.log('connection is open');
}

connection.onclose = (event) => {
    console.log("WebSocket is closed");
};

connection.onerror = (event) => {
    console.error("WebSocket error observed:", event);
};

connection.onmessage = (event) => {
    var data = JSON.parse(event.data);

    console.log(data);

    /*if (data.type === '') {

    }*/
}