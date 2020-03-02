import { ArgModule } from './module.js';
import { module_manager } from './client.js';
import { connection } from './init.js';

/**
 * Is x, y position hovering the trash icon?
 * 
 * @param {int} x 
 * @param {int} y
 * @returns {boolean} 
 */
function isHover(x, y) {

    if (x < 265 && x > 240 && y < 130 && y > 105) {
        return true;
    }
    return false;
}

function createModule (type, position, target, arg) {

    var mod = new ArgModule(position, type, target , id, arg);
	module_manager.add_module(mod);

	var newModule = {};
	newModule.type = 'createModule';
	newModule.moduleId = id;
	newModule.position = position;
	newModule.after = null;
	newModule.before = null;
	newModule.target = target;
	newModule.moduleType = type;
	newModule.arg = arg;

    connection.send(JSON.stringify(newModule));
    
}

export {
    isHover,
    createModule,
}