import { Module,ConditionModule, ArgModule, TargetModule, Element } from './module.js';
import { module_manager, element_manager, map } from './client.js';
import { connection } from './init.js';
import { dropdownContainer,dropdownMovement, dropdownControl, dropdownCondition } from './DOMAccess.js';

var targetModulePos = null;

/**
 * Is x, y position hovering the trash icon?
 * 
 * @param {int} x 
 * @param {int} y
 * @returns {boolean} 
 */
function isHover(x, y) {

    if (x < 290 && x > 260 && y < 130 && y > 105) {
		console.log(x, y);
        return true;
    }
    return false;
}

function createElement (id, position, send = false) {


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

	var mod = new TargetModule(targetModulePos,"target","target", t , id);

	module_manager.add_module(mod);

	dropdownContainer.classList.toggle("show");

	sendModuleInfo(mod, 'target', 'target', null);

}

function fillModuleDropDown(dropdown,json,type){
	for (let codeType in json){
		let dropdownElement = document.createElement("span");

		dropdownElement.innerText = codeType; //Esto estaria bien tener un nombre para el element
		dropdownElement.addEventListener("click", function(){clickDropDownModule(type,codeType);})
		dropdown.appendChild(dropdownElement);
	}
}

function clickDropDownModule (moduleType, codeType) {

	var mod;
	var id = Date.now();
	switch (moduleType){
		case 'control':
			mod = new ArgModule({x:100,y:100}, moduleType, codeType, id,null);
			dropdownControl.classList.toggle("show");
			break;
		case 'target':	
			mod = new TargetModule({x:100,y:100}, moduleType, "target",null, id);
			dropdownContainer.classList.toggle("show");
			break;
		case 'condition':
			mod = new ConditionModule({x:100,y:100}, moduleType, codeType, id, map);
			dropdownCondition.classList.toggle("show");
			break;
		default:
			mod = new Module({x:100,y:100}, moduleType, codeType, id);
			dropdownMovement.classList.toggle("show");
			break;
	}

	module_manager.add_module(mod);

	if (mod) {

		module_manager.add_module(mod);
		sendModuleInfo(mod, codeType, moduleType, null);

	}

	//FALTA AÑADIR SERVER
}

function showModuleList(moduleType){
	switch (moduleType){
		case 'control':
				targetModulePos = {x:100,y:100};
				dropdownControl.classList.toggle("show");
		case 'target':
				targetModulePos = {x:100,y:100};
				dropdownContainer.classList.toggle("show");
			break;
		case 'condition':
				targetModulePos = {x:100,y:100};
				dropdownCondition.classList.toggle("show");
			break;
		default:
				targetModulePos = {x:100,y:100};
				dropdownMovement.classList.toggle("show");
			break;
	}
}


function createModule (id, codeType, position,map = null, target = null, arg = null, moduleType = "basic", send = false, northID = {nodeId: null, type: false}, westID = {nodeId: null, type: false}, eastID = {nodeId: null, type: false}, southID = {nodeId: null, type: false} ) {

	var mod, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false};

	if (northID) {
		var northMod = module_manager.getModuleByID(northID.nodeId)[0];
		north.node = northMod;
		north.type = northID.type;
	}
	if (westID) {
		var westMod = module_manager.getModuleByID(westID.nodeId)[0];
		west.node = westMod;
		west.type = westID.type;
	}
	if (eastID) {
		var eastMod = module_manager.getModuleByID(eastID.nodeId)[0];
		east.node = eastMod;
		east.type = eastID.type;
	}
	if (southID) {
		var southMod = module_manager.getModuleByID(southID.nodeId)[0];
		south.node = southMod;
		south.type = southID.type;
	}
	switch (moduleType){
		case 'control':
			mod = new ArgModule(position, moduleType, codeType, id, arg, north, west, east, south);
			break;
		case 'target':
			mod = new TargetModule(position, moduleType,codeType, target, id, north, west, east, south);
			break;
		case 'condition':
			mod = new ConditionModule(position, moduleType, codeType, id,map, north, west, east, south);
			break;
		default:
			console.log('is default');
			mod = new Module(position, moduleType, codeType, id, north, west, east, south);
			break;
	}
	
    if (mod) {

		console.log('inif ', mod)
		module_manager.add_module(mod);

	}
	
    
}

function sendModuleInfo (module, codeType, moduleType, arg) {

	var newModule = {};
	newModule.type = 'createModule';
	newModule.id = module.id;
	newModule.posx = module.position.x;
	newModule.posy = module.position.y;
	newModule.north = {node: null, type: false};
	newModule.south = {node: null, type: false};
	newModule.east = {node: null, type: false};
	newModule.west = {node: null, type: false};
	newModule.target = module.target;
	newModule.codeType = codeType;
	newModule.moduleType = moduleType;
	newModule.arg = arg;

	console.log(module);
	console.log(newModule);
	
	connection.send(JSON.stringify(newModule));

}

function sendElementInfo (element) {

	var newElement = {};

	newElement.type = 'createElement';
	newElement.id = element.id;
	newElement.posx = element.position.x;
	newElement.posy = element.position.y;

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
	showModuleList,
	fillModuleDropDown
}