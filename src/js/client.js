import { ModuleManager, Element, ElementManager } from './module.js';
import { Map } from './map.js';
import { codes } from './codes.js';
import { connection } from './init.js';
import { isHover, createModule, paintInCanvas, createElement, fillModuleDropDown,showModuleList} from './utils.js';
import { wb_cvs,answerrun_confirm,answerrun_popup,answerrun_cancel,superrun_popup,fullPage,superrun_cancel,superrun_confirm, wb_ctx,gs_cvs, gs_ctx,conditionModule, basicModule, argModule, targetModule, element, workbench,game_screen, run_button, stop_button, competition_button, dropdownMovement, dropdownControl, dropdownCondition} from './DOMAccess.js';
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
const TILENUM =30;

var map =  new Map(TILENUM,TILENUM);;
////console.log(map);
var module_manager = new ModuleManager(codes);
var element_manager = new ElementManager();
var img = new Image();

img.src = "icons/basura.svg";

basicModule.addEventListener("click", function(){showModuleList("movement")});
argModule.addEventListener("click", function(){showModuleList("control")});
conditionModule.addEventListener("click", function(){showModuleList("condition")});
// argModule.addEventListener("click", function(){createModule(Date.now(), 'log',{x: 100, y: 200}, null, "Hola", "arg")});
targetModule.addEventListener("click", function(){showModuleList("target")});
element.addEventListener("click", function() {createElement(Date.now(), {x: 2, y:2})});

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

superrun_cancel.addEventListener("click",cancel_competition);
superrun_confirm.addEventListener("click",superrun);

// FUNCTIONS
function ans_no(){
	answerrun_popup.classList.toggle("showBlock");
}

function ans_ok(){
	element_manager.contestant =element_manager.elements[0].id
	answerrun_popup.classList.toggle("showBlock");
	connection.send(JSON.stringify({elementId:element_manager.contestant,type: 'acceptCompetition',sender:user}));

}

function cancel_competition(){
	superrun_popup.classList.toggle("showBlock");
	fullPage.classList.toggle('darkBack');
}

function superrun(){

	if(module_manager.everyone_ready){
		superrun_popup.classList.toggle("showBlock");
		fullPage.classList.toggle('darkBack');
		let jsonData ={};
		jsonData.type = 'superRun';
		jsonData.sender = user;
		
		connection.send(JSON.stringify(jsonData));
	}
	
}

function requestCompetition() {
	element_manager.contestant =element_manager.elements[0].id
	var jsonData = {};
	jsonData.type = 'requestCompetition';
	jsonData.mapRight = TILENUM;
	jsonData.mapBottom = TILENUM;
	jsonData.sender = user;
	jsonData.elementId = element_manager.contestant;

	superrun_popup.classList.toggle("showBlock");
	fullPage.classList.toggle('darkBack');
	
	connection.send(JSON.stringify(jsonData));
}
function run() {
	element_manager.refresh();
	module_manager.running = true;
}

function stop(){
	module_manager.running = false;
	////console.log(module_manager.abort);
}

function move(event) {

	mouseX = event.offsetX;
	mouseY = event.offsetY;
	module_manager.move_modules(event.offsetX, event.offsetY);
	
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
		////console.log(deletingModuleIds);
		deletingModuleIds.forEach(id => {
			var element = {};
			element.id = id;
			modules.push(element);
		})
	} 
	else {
		var activeModuleIds=[];
		module_manager.selectedGroup.get_children_ids(activeModuleIds)
		module_manager.release_modules();
		////console.log(activeModuleIds);
		activeModuleIds.forEach(id => {
			
			var module = module_manager.getModuleByID(id);
			var element = {};
			element.id = id;
			element.north = {nodeId: module.siblings.north.node ? module.siblings.north.node.id : null, type: module.siblings.north.type};
			element.south = {nodeId: module.siblings.south.node ? module.siblings.south.node.id : null, type: module.siblings.south.type};
			element.east = {nodeId: module.siblings.east.node ? module.siblings.east.node.id : null, type: module.siblings.east.type};
			element.west = {nodeId: module.siblings.west.node ? module.siblings.west.node.id : null, type: module.siblings.west.type};

			modules.push(element);
		})
	}

	////console.log('in release: ', modules);

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
	
}

function update_gs() {
	if(module_manager.ret.id){
		console.log("SUPERRESPONSE");
		let newData={};
		newData.type="superResponse";
		newData.element = module_manager.server_run(module_manager.ret.id);
		connection.send(JSON.stringify(newData));
		module_manager.ret.id = null;
	}
	
	gs_h = game_screen.clientHeight;
	gs_w = game_screen.clientWidth;
	
	ELEMENTSIZE = Math.min(Math.floor(gs_w/TILENUM)+2,Math.floor(gs_h/TILENUM)+2);
	
	gs_cvs.height = Math.min(Math.floor(gs_w/TILENUM)*TILENUM,Math.floor(gs_h/TILENUM)*TILENUM);
	gs_cvs.width = Math.min(Math.floor(gs_w/TILENUM)*TILENUM,Math.floor(gs_h/TILENUM)*TILENUM);
	

	
	module_manager.run_modules();
	
	element_manager.elements.forEach(element => {

		if (map.is_valid(element.position.x, element.position.y)) {

			map.matrix[element.position.y][element.position.x] = 1;

		}
		else {

			element.dead = true;

		}
	});
	
	!element_manager.any_alive ? module_manager.abort=true : null;
	
	paintInCanvas(gs_w, gs_h, gs_ctx, img, false);
	map.draw(gs_ctx);
	element_manager.draw(gs_ctx);
	
	
	
}

export{
	module_manager,
	element_manager,
	map,
	ELEMENTSIZE,
	MODULESIZE
}
