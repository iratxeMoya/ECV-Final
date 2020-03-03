import { Module, ArgModule, TargetModule, } from './module.js';
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

function createModule (codeType, position, target = null, arg = null, moduleType = "basic" ) {
 
    var id = Date.now();
	var mod;
	switch (moduleType){
		case 'arg':
			mod = new ArgModule(position, codeType, target , id, arg);
			break;
		case 'target':
			mod = new TargetModule(position, target , id);
			break;
		default:
			mod = new Module(position, codeType, id);
			break;
	}
    
	module_manager.add_module(mod);

	var newModule = {};
	newModule.type = 'createModule';
	newModule.moduleId = id;
	newModule.position = position;
	newModule.after = null;
	newModule.before = null;
	newModule.target = target;
	newModule.moduleType = codeType;
	newModule.arg = arg;

    connection.send(JSON.stringify(newModule));
    
}

function paintInCanvas (wb_w, wb_h, wb_ctx, img, trash) {

	wb_ctx.fillStyle = "#FFFFFF";
	wb_ctx.fillRect(0, 0, wb_w, wb_h);

	if (trash){
		wb_ctx.fillStyle = "#000000"
		wb_ctx.drawImage(img, 5, 5, 25, 25);
	}
}

export {
    isHover,
	createModule,
	paintInCanvas
}