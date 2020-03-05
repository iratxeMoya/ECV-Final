import { Module,ConditionModule, ArgModule, TargetModule, Element } from './module.js';
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

function createElement (id, position, send = true) {


	var element = new Element(id, position);
	element_manager.add_element(element);
	
	if (send) {
		sendElementInfo(element);
	}
	
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

	var t = element_manager.getElementById(this.id)[0]

	var mod = new TargetModule(targetModulePos, t , id);

	module_manager.add_module(mod);

	dropdownContainer.classList.toggle("show");

	sendModuleInfo(mod, 'target', 'target', null);

}

//Esta mal porque ya no hay prev y next asiqeu
function createModule (id, codeType, position, target = null, arg = null, moduleType = "basic", send = true, nextID = null, prevID = null ) {

	var mod, next = null, prev = null;
	if (nextID) {
		next = module_manager.getModuleByID(nextID)[0];
	}
	if (prevID) {
		prev = module_manager.getModuleByID(prevID)[0];
	}
	switch (moduleType){
		case 'arg':
			mod = new ArgModule(position, codeType, id, arg, next, prev);
			break;
		case 'target':
			if (send){
				targetModulePos = position;
				dropdownContainer.classList.toggle("show");
			} else {
				mod = new TargetModule(position, target, id, next, prev);
			}
			break;
		case 'condition':
			mod = new ConditionModule(position,codeType,id);
			break;
		default:
			mod = new Module(position, codeType, id, next, prev);
			break;
	}
    if (mod) {

		module_manager.add_module(mod);

		if(send) {

			sendModuleInfo(mod, codeType, moduleType, arg);

		}
		

	}
	
    
}

function sendModuleInfo (module, codeType, moduleType, arg) {

	var newModule = {};
	newModule.type = 'createModule';
	newModule.id = module.id;
	newModule.posx = module.position.x;
	newModule.posy = module.position.y;
	newModule.next = null;
	newModule.prev = null;
	newModule.target = module.target;
	newModule.codeType = codeType;
	newModule.moduleType = moduleType;
	newModule.arg = arg;

	connection.send(JSON.stringify(newModule));

}

function sendElementInfo (element) {

	var newElement = {};

	newElement.type = 'createElement';
	newElement.id = element.id;
	newElement.posx = element.parameters.posx;
	newElement.posy = element.parameters.posy;

	connection.send(JSON.stringify(newElement));

}

function paintInCanvas (wb_w, wb_h, wb_ctx, img, trash) {

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
	paintInCanvas,
	clickDropDownElement,
}