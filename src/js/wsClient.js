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
    var jsonData = JSON.parse(event.data);

    console.log(jsonData);

    if (jsonData.type === 'moveModule') {
        console.log('module moving: ', jsonData);
    }
    else if (jsonData.type === 'createModule') {
        console.log('Module created: ', jsonData);
    }
}