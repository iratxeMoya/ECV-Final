import { connection } from './init.js';
import { module_manager } from './client.js'
import { createModule, createElement } from './utils.js';
import { codeEditorPage, loginPage, regPage } from './DOMAccess.js';

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

        module_manager.move_modules(jsonData.newPosition.x, jsonData.newPosition.y);
    }
    else if (jsonData.type === 'reciveInfo') {

        if (jsonData.objectType === 'module') {

            createModule(jsonData.id, jsonData.codeType, {x: jsonData.posx, y: jsonData.posy}, jsonData.target, jsonData.arg, jsonData.moduleType, false, jsonData.north, jsonData.west, jsonData.east, jsonData.south)

        }
        else if (jsonData.objectType === 'element') {

            createElement(jsonData.id, {x: jsonData.posx, y: jsonData.posy}, false)

        }
    }
    else if (jsonData.type === 'clickModule') {

        module_manager.click_modules(jsonData.newPosition.x, jsonData.newPosition.y);
    }
    else if (jsonData.type === 'releaseModule') {

        if (jsonData.remove) {
            module_manager.delete_module(jsonData.screenX, jsonData.screenY);
        }

        module_manager.release_modules();

    }
    else if (jsonData.type === 'createModule') {

        createModule(jsonData.id, jsonData.codeType, {x: jsonData.posx, y: jsonData.posy}, jsonData.target, jsonData.arg, jsonData.moduleType, false, jsonData.north, jsonData.west, jsonData.east, jsonData.south);
		
    }
    else if (jsonData.type === 'createElement') {

        createElement(jsonData.id, {x: jsonData.posx, y: jsonData.posy}, false);

    }
    else if (jsonData.type === 'connectionResponse') {

        if(jsonData.status === 'OK') {

            codeEditorPage.classList.toggle("show");

            jsonData.connectionType === 'login'
                ? loginPage.classList.toggle("show")
                : regPage.classList.toggle("show");
            
            

        }
    }
}