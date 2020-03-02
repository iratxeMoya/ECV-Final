import { ModuleManager, activeModuleIds, deletingModuleIds } from './module.js';
import { codes } from './codes.js';
import { connection } from './init.js';
import { isHover, createModule, paintInCanvas } from './utils.js';
import { cvs, ctx, moduleType_1, moduleType_2, workbench, run_button } from './DOMAccess.js';

var wb_h = workbench.style.height;
var wb_w = workbench.style.width;
var updater = setInterval(update, 0.5);
var mouseDown = false;
var mouseX;
var mouseY;

var module_manager = new ModuleManager(codes);
var img = new Image();

img.src = "icons/basura.svg";

moduleType_1.addEventListener("click", function(){createModule('log1', {x: 100, y: 100}, null, prompt("Please enter text to log:", "HI"))});
moduleType_2.addEventListener("click", function(){createModule('log2', {x: 100, y: 200}, null, prompt("Please enter text to log:", "HO"))});
run_button.addEventListener("click", run);
cvs.addEventListener("mousemove", move);
cvs.addEventListener("mousedown", click);
cvs.addEventListener("mouseup", release);

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

	connection.send(JSON.stringify({type: 'releaseModule', position: {x: event.offsetX, y: event.offsetY}, remove: remove, modules: remove ? deletingModuleIds : activeModuleIds}));

}

//LOOP
function update() {

	wb_h = workbench.clientHeight;
	wb_w = workbench.clientWidth;
	cvs.height = wb_h;
	cvs.width = wb_w;

	paintInCanvas(wb_w, wb_h, ctx, mouseX, mouseY, img);

	module_manager.draw(ctx);
}

export{
	module_manager,
}
