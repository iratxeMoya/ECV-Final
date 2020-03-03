import { ModuleManager, activeModuleIds, deletingModuleIds, Element, ElementManager } from './module.js';
import { codes } from './codes.js';
import { connection } from './init.js';
import { isHover, createModule, paintInCanvas, createElement } from './utils.js';
import { wb_cvs, wb_ctx,gs_cvs, gs_ctx, basicModule, argModule, targetModule, element, workbench,game_screen, run_button } from './DOMAccess.js';

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

basicModule.addEventListener("click", function(){createModule('log2', {x: 100, y: 100})});
argModule.addEventListener("click", function(){createModule('log1',{x: 100, y: 200}, null, "Hola", "arg")});
targetModule.addEventListener("click", function(){createModule(null,{x: 100, y: 200}, null, null,"target")});
element.addEventListener("click", function() {createElement({x: 100, y:100})});

run_button.addEventListener("click", run);
wb_cvs.addEventListener("mousemove", move);
wb_cvs.addEventListener("mousedown", click);
wb_cvs.addEventListener("mouseup", release);

// FUNCTIONS
function run() {

	module_manager.run_modules();

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
			element.prev = module.prev ? module.prev.id : null;
			element.next = module.next ? module.next.id : null;

			modules.push(element);
		})
	} else {
		activeModuleIds.forEach(id => {
			var module = module_manager.getModuleByID(id)[0];
			var element = {};
			element.id = id;
			element.prev = module.prev ? module.prev.id : null;
			element.next = module.next ? module.next.id : null;

			modules.push(element);
		})
	}


	connection.send(JSON.stringify({type: 'releaseModule', position: {x: event.offsetX, y: event.offsetY}, remove: remove, modules: modules}));

}

//LOOP
function update() {

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
