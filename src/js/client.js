import { ArgModule, ModuleManager, activeModuleIds, deletingModuleIds } from './module.js';
import { codes } from './codes.js';
import { connection } from './init.js';
import { isHover } from './utils.js';

var modules = document.getElementsByClassName("module");
var updater = setInterval(update, 0.5);

var mouseDown = false;

var cvs = document.getElementById("workbench");
var ctx = cvs.getContext("2d");

var module_manager = new ModuleManager(codes);

var moduleType_1 = document.querySelector("#module1");
var moduleType_2 = document.querySelector("#module2");

moduleType_1.addEventListener("click", createModuleType_1);
moduleType_2.addEventListener("click", createModuleType_2);

function createModuleType_1 () {

	var id = Date.now();

	var arg = prompt("Please enter text to log:", "HI");
	var mod = new ArgModule({x: 100, y: 100}, "log", "none" , id, arg);
	module_manager.add_module(mod);

	var newModule = {};
	newModule.type = 'createModule';
	newModule.moduleId = id;
	newModule.position = {x: 100, y: 100};
	newModule.after = null;
	newModule.before = null;
	newModule.target = "none";
	newModule.moduleType = "log";
	newModule.arg = arg;

	connection.send(JSON.stringify(newModule));

}

function createModuleType_2 () {

	var id = Date.now();;

	var arg = prompt("Please enter text to log:", "HO");
	var mod = new ArgModule({x: 100, y: 200}, "log", "none" , id, arg);
	module_manager.add_module(mod);

	var newModule = {};
	newModule.type = 'createModule';
	newModule.moduleId = id;
	newModule.position = {x: 100, y: 100};
	newModule.after = null;
	newModule.before = null;
	newModule.target = "none";
	newModule.moduleType = "log";
	newModule.arg = arg;

	connection.send(JSON.stringify(newModule));
	
}


var workbench = document.getElementsByClassName("user_screen")[0];
var run_button = document.getElementsByClassName("run_code")[0];

var wb_h = workbench.style.height;
var wb_w = workbench.style.width;

var mouseX;
var mouseY;

var moving = [];

run_button.addEventListener("click", function() {

		module_manager.run_modules();

});

cvs.addEventListener("mousemove", function(event) {

		mouseX = event.offsetX;
		mouseY = event.offsetY;
		module_manager.move_modules(event.offsetX, event.offsetY);
		
		if (mouseDown) {

			var jsonData = {};
			jsonData.type = 'moveModule'
			jsonData.newPosition = {x: mouseX, y: mouseY};

			connection.send(JSON.stringify(jsonData));

		}
		

});

cvs.addEventListener("mousedown", function(event) {

	mouseDown = true;

	module_manager.click_modules(event.offsetX, event.offsetY);
	
	var jsonData = {};
	jsonData.type = 'clickModule'
	jsonData.newPosition = {x: event.offsetX, y: event.offsetY};

	connection.send(JSON.stringify(jsonData));

});

cvs.addEventListener("mouseup", function(event) {

	mouseDown = false;
	var remove = false;

	if (isHover(event.screenX, event.screenY)) {

		module_manager.delete_module();
		remove = true;

	}

	console.log('modules: ', activeModuleIds, deletingModuleIds);

	connection.send(JSON.stringify({type: 'releaseModule', position: {x: event.offsetX, y: event.offsetY}, remove: remove, modules: remove ? deletingModuleIds : activeModuleIds}));

	module_manager.release_modules();

});
var img = new Image();
img.src = "icons/basura.svg";

function update() {

	wb_h = workbench.clientHeight;
	wb_w = workbench.clientWidth;
	cvs.height = wb_h;
	cvs.width = wb_w;
	
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, wb_w, wb_h);
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(mouseX, mouseY, 5, 5);

	ctx.fillStyle = "#000000"
	

	ctx.drawImage(img, 5, 5, 25, 25);

	module_manager.draw(ctx);
}

export{
	module_manager,
}