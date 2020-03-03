import { Module, ArgModule, TargetModule, Element } from './module.js';
import { module_manager, element_manager } from './client.js';
import { connection } from './init.js';
import { dropdownContainer } from './DOMAccess.js';

var targetModulePos = null;

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

function createElement (position) {

	var id = Date.now();

	var element = new Element(id, position);
	element_manager.add_element(element);

	var newElement = {};

	newElement.type = 'createElement';
	newElement.id = id;
	newElement.position = position;

	connection.send(JSON.stringify(newElement));

	var dropdownElement = document.createElement("span");
	dropdownElement.id = id;

	var elementsWithId = document.getElementById(id);
    if (!elementsWithId) {

		dropdownElement.innerText = id; //Esto estaria bien tener un nombre para el element
		dropdownElement.addEventListener("click", clickDropDownElement)
		dropdownContainer.appendChild(dropdownElement);

	}
	

}

function clickDropDownElement () {

	var id = Date.now();

	var t = element_manager.getElementById(this.id)
	console.log('target: ', t, this.id)
	var mod = new TargetModule(targetModulePos, t , id);
	module_manager.add_module(mod);
	dropdownContainer.classList.toggle("show");

	var newModule = {};
	newModule.type = 'createModule';
	newModule.moduleId = id;
	newModule.position = targetModulePos;
	newModule.after = null;
	newModule.before = null;
	newModule.target = t;
	newModule.moduleType = 'target';
	newModule.arg = null;

	connection.send(JSON.stringify(newModule));
}

function createModule (codeType, position, target = null, arg = null, moduleType = "basic" ) {
 
    var id = Date.now();
	var mod;
	switch (moduleType){
		case 'arg':
			mod = new ArgModule(position, codeType, id, arg);
			break;
		case 'target':
			console.log('is target');
			targetModulePos = position;
			dropdownContainer.classList.toggle("show");
			break;
		default:
			mod = new Module(position, codeType, id);
			break;
	}
    if (mod) {

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
	
    
}

function paintInCanvas (wb_w, wb_h, wb_ctx, img, trash, mouseX, mouseY) {

	wb_ctx.fillStyle = "#FFFFFF";
	wb_ctx.fillRect(0, 0, wb_w, wb_h);

	if (trash){

		wb_ctx.fillStyle = "#FFFFFF";
		wb_ctx.drawImage(img, 5, 5, 25, 25);
		
	}

}

export {
    isHover,
	createModule,
	createElement,
	paintInCanvas
}