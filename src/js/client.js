import { ModuleManager, ElementManager, nextElementPos } from './module.js';
import { Map } from './map.js';
import { codes } from './codes.js';
import { connection } from './init.js';
import { isHover, paintInCanvas, createElement, fillModuleDropDown,showModuleList, selectedElement } from './utils.js';
import { wb_cvs, elementSelectASK, elementSelectANS, elementSelectBtnASK, elementSelectBtnANS, answerrun_confirm, answerrun_popup, answerrun_cancel, superrun_popup, noUsers_accept, noUsers, superrun_cancel, superrun_confirm, wb_ctx, gs_cvs, gs_ctx, conditionModule, basicModule, argModule, targetModule, element, workbench, game_screen, run_button, stop_button, competition_button, dropdownMovement, dropdownControl, dropdownCondition } from './DOMAccess.js';
import { user }	from './wsClient.js';

var wb_h = workbench.style.height;
var wb_w = workbench.style.width;
var gs_h = game_screen.style.height;
var gs_w = game_screen.style.width;
var updater = setInterval(update_workbench, 0.5);
var gs_updater = setInterval(update_gs, 100);
var mouseDown = false;
var mouseX;
var mouseY;
var setup = true;
var ELEMENTSIZE = 25;
var MODULESIZE = 40;
const TILENUM = 30;
var timer =0;

var map =  new Map(TILENUM,TILENUM);;
var module_manager = new ModuleManager(codes);
var element_manager = new ElementManager();
var img = new Image();

img.src = "icons/basura.svg";

basicModule.addEventListener("click", function(){showModuleList("movement")});
argModule.addEventListener("click", function(){showModuleList("control")});
conditionModule.addEventListener("click", function(){showModuleList("condition")});
targetModule.addEventListener("click", function(){showModuleList("target")});
element.addEventListener("click", function() {
	var name = prompt("Please enter element name:", "Untitled Element");
	if (name === null || name === '') {
		name = 'Untitled Element';
	}
	createElement(name, Date.now(), nextElementPos)
});

run_button.addEventListener("click", run);
stop_button.addEventListener("click", stop);
competition_button.addEventListener("click", requestCompetition);
wb_cvs.addEventListener("mousemove", move);
wb_cvs.addEventListener("mousedown", click);
wb_cvs.addEventListener("mouseup", release);

fillModuleDropDown(dropdownMovement,codes.movement,"movement");
fillModuleDropDown(dropdownControl,codes.control,"control");
fillModuleDropDown(dropdownCondition,codes.condition,"condition");

answerrun_cancel.addEventListener("click",ans_no);
answerrun_confirm.addEventListener("click",ans_ok);
elementSelectBtnASK.addEventListener("click", showListASK);
elementSelectBtnANS.addEventListener("click", showListANS);

superrun_cancel.addEventListener("click",cancel_competition);
superrun_confirm.addEventListener("click",superrun);
noUsers_accept.addEventListener("click", noUsersAccept);



// FUNCTIONS
function showListASK() {
	console.log('ask')
	elementSelectASK.classList.toggle("showBlock");
}
function showListANS() {
	console.log('ans')
	elementSelectANS.classList.toggle("showBlock");
}

function noUsersAccept() {

	noUsers.classList.toggle("showBlock");

}


function ans_no() {

	answerrun_popup.classList.toggle("showBlock");

	connection.send(JSON.stringify({type:'denyCompetition', sender: user}));

}

function ans_ok() {

	if (selectedElement) {

		element_manager.contestant = selectedElement;
		console.log('selected ',element_manager.contestant);
		answerrun_popup.classList.toggle("showBlock");
		connection.send(JSON.stringify({elementId:element_manager.contestant,type: 'acceptCompetition',sender: user}));

	}
	else {

		alert("You have to select an element first!");

	}
	

}

function cancel_competition() {

	superrun_popup.classList.toggle("showBlock");
	superrun_confirm.innerText = '';
	let spinner = document.createElement("div");
	spinner.classList.add("spinner-grow");
	spinner.classList.add("text-muted");
	superrun_confirm.appendChild(spinner);
	superrun_confirm.disabled = true;
	fullPage.classList.toggle('darkBack');

	connection.send(JSON.stringify({type: 'cancelCompetition', sender: user}));

}

function superrun() {

	if(module_manager.everyone_ready) {

		if (selectedElement) {

			superrun_popup.classList.toggle("showBlock");

			let jsonData ={};
			jsonData.type = 'superRun';
			jsonData.sender = user;
			jsonData.contestant = selectedElement;
			element_manager.contestant = selectedElement;
			
			connection.send(JSON.stringify(jsonData));

		}
		else {

			alert("You have to select an element first!");

		}

	}
	
}

function requestCompetition() {

	element_manager.contestant = selectedElement;
	console.log('selected ',element_manager.contestant);

	var jsonData = {};
	jsonData.type = 'requestCompetition';
	jsonData.mapRight = TILENUM;
	jsonData.mapBottom = TILENUM;
	jsonData.sender = user;
	jsonData.elementId = element_manager.contestant;

	superrun_popup.classList.toggle("showBlock");
	
	connection.send(JSON.stringify(jsonData));

}

function run() {

	element_manager.refresh();
	module_manager.running = true;

}

function stop() {

	module_manager.running = false;
	element_manager.reset();

}

function move(event) {

	mouseX = event.offsetX;
	mouseY = event.offsetY;
	module_manager.move_modules(event.offsetX, event.offsetY);
	timer = new Date().getTime();
	module_manager.moduleInfo=null;
	
	if (mouseDown) {

		var jsonData = {};
		jsonData.type = 'moveModule'
		jsonData.newPosition = {x: mouseX, y: mouseY};
		jsonData.sender = user;

		connection.send(JSON.stringify(jsonData));

	}
	

}

function click(event) {

	mouseDown = true;

	module_manager.click_modules(event.offsetX, event.offsetY);
	
	var jsonData = {};
	jsonData.type = 'clickModule'
	jsonData.newPosition = {x: event.offsetX, y: event.offsetY};
	jsonData.sender = user;

	connection.send(JSON.stringify(jsonData));

}

function release(event) {

	mouseDown = false;
    var remove = false;
	var modules = [];

	if (isHover(module_manager.selectedGroup.position.x, module_manager.selectedGroup.position.y) && module_manager.selectedGroup) {

		var deletingModuleIds = module_manager.remove_modules(module_manager.selectedGroup);
		module_manager.selectedGroup = null;
		remove = true;

		deletingModuleIds.forEach(id => {

			var element = {};
			element.id = id;
			modules.push(element);

		});

	} 
	else {

		var activeModuleIds=[];
		module_manager.selectedGroup.get_children_ids(activeModuleIds)
		module_manager.release_modules();

		activeModuleIds.forEach(id => {
			
			var module = module_manager.getModuleByID(id);
			var element = {};
			element.id = id;
			element.north = {nodeId: module.siblings.north.node ? module.siblings.north.node.id : null, type: module.siblings.north.type};
			element.south = {nodeId: module.siblings.south.node ? module.siblings.south.node.id : null, type: module.siblings.south.type};
			element.east = {nodeId: module.siblings.east.node ? module.siblings.east.node.id : null, type: module.siblings.east.type};
			element.west = {nodeId: module.siblings.west.node ? module.siblings.west.node.id : null, type: module.siblings.west.type};

			modules.push(element);

		});

	}

	connection.send(JSON.stringify({sender:user,type: 'releaseModule', posx: event.offsetX, posy: event.offsetY, 'remove': remove, modules: modules, screenX: event.screenX, screenY: event.screenY}));

}

//LOOP
function update_workbench() {

	wb_h = workbench.clientHeight;
	wb_w = workbench.clientWidth;
	wb_cvs.height = wb_h;
	wb_cvs.width = wb_w;

	paintInCanvas(wb_w, wb_h, wb_ctx, img, true, mouseX, mouseY);

	module_manager.draw(wb_ctx);
	
	var now = new Date().getTime();
	console.log("NO");
	if(Math.abs(timer-now)>1000){
		console.log("YES");
		module_manager.is_hover(event.offsetX,event.offsetY);
	}
	
}

function update_gs() {

	if(module_manager.ret.id){

		console.log('update_gs ', module_manager.ret);

		let newData = {};
		newData.type = 'superResponse';
		newData.element = module_manager.server_run(module_manager.ret.id);

		connection.send(JSON.stringify(newData));

		module_manager.ret.id = null;

	}
	
	gs_h = game_screen.clientHeight;
	gs_w = game_screen.clientWidth;
	
	ELEMENTSIZE = Math.min(Math.floor(gs_w/TILENUM),Math.floor(gs_h/TILENUM));
	
	gs_cvs.height = ELEMENTSIZE*TILENUM;
	gs_cvs.width = ELEMENTSIZE*TILENUM;
	
	module_manager.run_modules();
	
	element_manager.elements.forEach(element => {

		if (map.is_valid(element.position.x, element.position.y)) {

			map.matrix[element.position.y][element.position.x] = 1;

		}
		else {

			element.dead = true;

		}
	});
	
	!element_manager.any_alive() ? module_manager.running = false : null;
	!element_manager.any_alive() ? element_manager.reset() : null;
	
	paintInCanvas(gs_w, gs_h, gs_ctx, img, false);
	map.draw(gs_ctx);
	element_manager.draw(gs_ctx);
	
}

export {
	module_manager,
	element_manager,
	map,
	ELEMENTSIZE,
	MODULESIZE,
	TILENUM
}
