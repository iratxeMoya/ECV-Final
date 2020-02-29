import { connection } from './init.js';
import { module_manager } from './client.js'
import { ArgModule } from './module.js';

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
}