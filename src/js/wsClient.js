import { connection } from './init.js';
import { module_manager, element_manager } from './client.js'
import { ArgModule, Element } from './module.js';
import { dropdownContainer } from './DOMAccess.js';
import { clickDropDownElement } from './utils.js';

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
    else if (jsonData.type === 'clickModule') {

        module_manager.click_modules(jsonData.newPosition.x, jsonData.newPosition.y);
    }
    else if (jsonData.type === 'releaseModule') {

        if (jsonData.remove) {
            
            module_manager.delete_module();
        }

        module_manager.release_modules();

    }
    else if (jsonData.type === 'createModule') {

        console.log('in client: ', jsonData.position);

        var newModule = new ArgModule(jsonData.position, jsonData.moduleType, jsonData.target, jsonData.moduleId, jsonData.arg, jsonData.next, jsonData.prev);

        module_manager.add_module(newModule);
    }
    else if (jsonData.type === 'createElement') {

        console.log('in client: ', jsonData);

        var newElement = new Element(jsonData.id, jsonData.position);

        element_manager.add_element(newElement);

        var dropdownElement = document.createElement("span");
        dropdownElement.id = jsonData.id;

        var elementsWithId = document.getElementById(jsonData.id);

        if (!elementsWithId) {

            dropdownElement.innerText = id; //Esto estaria bien tener un nombre para el element
            dropdownElement.addEventListener("click", clickDropDownElement)
            dropdownContainer.appendChild(dropdownElement);

        }
    }
}