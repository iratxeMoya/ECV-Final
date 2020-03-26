import { Module,ConditionModule, ArgModule, TargetModule, Element } from './module.js';
import { module_manager, element_manager, map } from './client.js';
import { connection } from './init.js';
import { dropdownContainer, elementSelect, dropdownMovement, dropdownControl, dropdownCondition, projInfoContainer, projUserContainer, projListContainer, argModule, basicModule, conditionModule, targetModule } from './DOMAccess.js';
import { user } from './wsClient.js';

var targetModulePos = null;
var thereAreElements = false;
var selectedElement = null;

function isHover(x, y) {

    if (x < 25 && x > 0 && y < 35 && y > 0) {

		console.log(x, y);
		return true;
		
	}
	
    return false;
}

function createElement (id, position, send = true) {

	thereAreElements = true;
	var element = new Element(id, position);
	element_manager.add_element(element);
	
	if (send) {

		sendElementInfo(element);

	}
	
	var dropdownElement = document.createElement("span");
	var dropdownElement2 = document.createElement("span");

	dropdownElement.id = id;
	dropdownElement2.id = id;

	var elementsWithId = document.getElementById(id);

    if (!elementsWithId) {

		dropdownElement.innerText = id; //Esto estaria bien tener un nombre para el element
		dropdownElement2.innerText = id; //Esto estaria bien tener un nombre para el element

		dropdownElement.addEventListener("click", clickDropDownElement)
		dropdownElement2.addEventListener("click", selectElement);
		dropdownContainer.appendChild(dropdownElement);
		elementSelect.appendChild(dropdownElement2);

	}
	

}

function selectElement() {

	selectedElement = this.id;
	console.log(selectedElement);
}

function clickDropDownElement () {

	var id = Date.now();

	var t = element_manager.getElementById(this.id)[0]
	var mod = new TargetModule(targetModulePos,"target","target", t , id);

	module_manager.add_module(mod);

	dropdownContainer.classList.toggle("showBlock");

	sendModuleInfo(mod, 'target', 'target', null);

}

function fillModuleDropDown(dropdown, json, type) {

	for (let codeType in json) {

		let dropdownElement = document.createElement("span");

		dropdownElement.innerText = codeType; //Esto estaria bien tener un nombre para el element
		dropdownElement.addEventListener("click", function(){clickDropDownModule(type,codeType);})
		dropdown.appendChild(dropdownElement);

	}
}

function clickDropDownModule (moduleType, codeType) {

	var mod;
	var id = Date.now();

	switch (moduleType) {

		case 'control':

			mod = new ArgModule({x:100,y:100}, moduleType, codeType, id,null);
			dropdownControl.classList.toggle("showBlock");
			argModule.classList.toggle("spaceDown");
			break;

		case 'target':

			mod = new TargetModule({x:100,y:100}, moduleType, "target",null, id);
			thereAreElements ? dropdownContainer.classList.toggle("showBlock"): null;
			thereAreElements ? targetModule.classList.toggle("spaceDown") : null;
			break;

		case 'condition':

			mod = new ConditionModule({x:100,y:100}, moduleType, codeType, id, map);
			dropdownCondition.classList.toggle("showBlock");
			conditionModule.classList.toggle("spaceDown");
			break;

		default:

			mod = new Module({x:100,y:100}, moduleType, codeType, id);
			dropdownMovement.classList.toggle("showBlock");
			basicModule.classList.toggle("spaceDown");
			break;

	}

	module_manager.add_module(mod);

	if (mod) {

		module_manager.add_module(mod);
		sendModuleInfo(mod, codeType, moduleType, null);

	}

}

function showModuleList(moduleType) {

	switch (moduleType) {

		case 'control':

			targetModulePos = {x:100,y:100};
			argModule.classList.toggle("spaceDown");
			dropdownControl.classList.toggle("showBlock");
			break;

		case 'target':

			targetModulePos = {x:100,y:100};
			thereAreElements ? dropdownContainer.classList.toggle("showBlock"): null;
			thereAreElements ? targetModule.classList.toggle("spaceDown") : null;
			break;

		case 'condition':

			targetModulePos = {x:100,y:100};
			conditionModule.classList.toggle("spaceDown");
			dropdownCondition.classList.toggle("showBlock");
			break;

		default:

			targetModulePos = {x:100,y:100};
			basicModule.classList.toggle("spaceDown");
			dropdownMovement.classList.toggle("showBlock");
			break;

	}
}


function createModule (id, codeType, position, map = null, target = null, arg = null, moduleType = "movement", send = false, northID = {nodeId: null, type: false}, westID = {nodeId: null, type: false}, eastID = {nodeId: null, type: false}, southID = {nodeId: null, type: false} ) {

	var mod = null, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false};

	if (northID) {

		var northMod = module_manager.getModuleByID(northID.nodeId);
		north.node = northMod;
		north.type = northID.type;

	}
	if (westID) {

		var westMod = module_manager.getModuleByID(westID.nodeId);
		west.node = westMod;
		west.type = westID.type;

	}
	if (eastID) {

		var eastMod = module_manager.getModuleByID(eastID.nodeId);
		east.node = eastMod;
		east.type = eastID.type;

	}
	if (southID) {

		var southMod = module_manager.getModuleByID(southID.nodeId);
		south.node = southMod;
		south.type = southID.type;

	}

	switch (moduleType) {

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

			mod = new Module(position, moduleType, codeType, id, north, west, east, south);
			break;

	}
	
    if (mod) {

		module_manager.add_module(mod);
		console.log(module_manager.modules, mod);

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
	newModule.sender = user;
	
	connection.send(JSON.stringify(newModule));

}

function sendElementInfo (element) {

	var newElement = {};

	newElement.type = 'createElement';
	newElement.id = element.id;
	newElement.posx = element.position.x;
	newElement.posy = element.position.y;
	newElement.sender = user;

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

var actualProject = null;
var isSelected = false;

function requestProjInfo () {

	var jsonData = {};
	jsonData.type = 'requestProjInfo';
	jsonData.project = this.innerText;

	actualProject = this.innerText;

	focusElement(this, projListContainer);

	if (!isSelected) {

		for (var i = 0; i < projInfoContainer.classList.length; i++) {

			var className = projInfoContainer.classList[i];

			if (className === 'showGrid') {

				projInfoContainer.classList.toggle('showGrid');

			}

		}
	}
	else {

		var showing = false;

		for (var i = 0; i < projInfoContainer.classList.length; i++) {

			var className = projInfoContainer.classList[i];

			if (className === 'showGrid') {

				showing = true;

			}
		}
		if(!showing) {
			
			projInfoContainer.classList.toggle('showGrid');

		}
	}

	jsonData.sender = user;
	connection.send(JSON.stringify(jsonData));
}

function deleteUser () {

	focusElement(this, projUserContainer);

}

function focusElement (elem, par) {

	var children = par.children;
	var isElem = false;

	for (var i = 0; i < children.length; i++) {
		var child = children[i];

		for (var j = 0; j < child.classList.length; j++) {

			var className = child.classList[j];
			if (className === 'clicked') {

				if(child === elem) {

					isSelected = false;
					isElem = true;

				}

				child.classList.toggle('clicked');
			}
		}
	}

	if (!isElem) {

		isSelected = true;
		elem.classList.toggle('clicked');
		
	}
	

}

export {
    isHover,
	createModule,
	createElement,
	paintInCanvas,
	clickDropDownElement,
	showModuleList,
	fillModuleDropDown,
	requestProjInfo,
	actualProject,
	isSelected,
	deleteUser,
	selectedElement
}