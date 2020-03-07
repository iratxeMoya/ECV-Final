import { ModuleManager, activeModuleIds, deletingModuleIds, Element, ElementManager } from './module.js';
import { codes } from './codes.js';
import { connection } from './init.js';
import { isHover, createModule, paintInCanvas, createElement } from './utils.js';
import { wb_cvs, wb_ctx,gs_cvs, gs_ctx,conditionModule, basicModule, argModule, targetModule, element, workbench,game_screen, run_button } from './DOMAccess.js';

var wb_h = workbench.style.height;
var wb_w = workbench.style.width;
var gs_h = game_screen.style.height;
var gs_w = game_screen.style.width;
var updater = setInterval(update, 0.5);
var mouseDown = false;
var mouseX;
var mouseY;

var module_manager = new ModuleManager(codes);
var element_manager = new ElementManager();
var img = new Image();

img.src = "icons/basura.svg";

basicModule.addEventListener("click", function(){createModule(Date.now(), 'move', {x: 100, y: 100})});
conditionModule.addEventListener("click", function(){createModule(Date.now(), 'ifwall', {x: 100, y: 100},null,null,"condition")});
argModule.addEventListener("click", function(){createModule(Date.now(), 'log',{x: 100, y: 200}, null, "Hola", "arg")});
targetModule.addEventListener("click", function(){createModule(Date.now(), null,{x: 100, y: 200}, null, null, "target")});
element.addEventListener("click", function() {createElement(Date.now(), {x: 100, y:100})});

run_button.addEventListener("click", run);
run_button.addEventListener("click", stop);
wb_cvs.addEventListener("mousemove", move);
wb_cvs.addEventListener("mousedown", click);
wb_cvs.addEventListener("mouseup", release);

// FUNCTIONS
function run() {

	module_manager.running = true;
}

function stop(){
	module_manager.running = false;
	console.log(module_manager.abort);
}

function move(event) {

	mouseX = event.offsetX;
	mouseY = event.offsetY;
	module_manager.move_modules(event.offsetX, event.offsetY);
	
	if (mouseDown) {

		var jsonData = {};
		jsonData.type = 'moveModule'
		jsonData.newPosition = {x: mouseX, y: mouseY};

		connection.send(JSON.stringify(jsonData));

	}
	

}

function click(event) {

	mouseDown = true;

	module_manager.click_modules(event.offsetX, event.offsetY);
	
	var jsonData = {};
	jsonData.type = 'clickModule'
	jsonData.newPosition = {x: event.offsetX, y: event.offsetY};

	connection.send(JSON.stringify(jsonData));

}

function release(event) {

	mouseDown = false;
	var remove = false;

	if (isHover(event.screenX, event.screenY)) {

		module_manager.delete_module();
		remove = true;

	}

	module_manager.release_modules();

	var modules = [];

	if (remove) {
		deletingModuleIds.forEach(id => {
			var module = module_manager.getModuleByID(id)[0];
			var element = {};
			element.id = id;
			element.north = {nodeId: module.siblings.north.node ? module.siblings.north.node.id : null, type: module.siblings.north.type};
			element.south = {nodeId: module.siblings.south.node ? module.siblings.south.node.id : null, type: module.siblings.south.type};
			element.east = {nodeId: module.siblings.east.node ? module.siblings.east.node.id : null, type: module.siblings.east.type};
			element.west = {nodeId: module.siblings.west.node ? module.siblings.west.node.id : null, type: module.siblings.west.type};

			modules.push(element);
		})
	} else {
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


	connection.send(JSON.stringify({type: 'releaseModule', posx: event.offsetX, posy: event.offsetY, remove: remove, modules: modules}));

}

//LOOP
function update() {

	module_manager.run_modules();

	wb_h = workbench.clientHeight;
	wb_w = workbench.clientWidth;
	wb_cvs.height = wb_h;
	wb_cvs.width = wb_w;
	
	gs_h = game_screen.clientHeight;
	gs_w = game_screen.clientWidth;
	gs_cvs.height = gs_h;
	gs_cvs.width = gs_w;

	paintInCanvas(wb_w, wb_h, wb_ctx, img, true, mouseX, mouseY);
	paintInCanvas(gs_w, gs_h, gs_ctx, img, false);

	module_manager.draw(wb_ctx);
	element_manager.draw(gs_ctx);
}

export{
	module_manager,
	element_manager
}
