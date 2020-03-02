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

    var id = Date.now();
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

function paintInCanvas (wb_w, wb_h) {

	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, wb_w, wb_h);

	ctx.fillStyle = "#FF0000";
	ctx.fillRect(mouseX, mouseY, 5, 5);

	ctx.fillStyle = "#000000"
	ctx.drawImage(img, 5, 5, 25, 25);

}

export {
    isHover,
	createModule,
	paintInCanvas
}