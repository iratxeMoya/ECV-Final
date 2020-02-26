import { Module,ArgModule,ModuleManager } from './module.js';
import { codes } from './codes.js';

var modules = document.getElementsByClassName("module");
var updater = setInterval(update, 50);

var cvs = document.getElementById("workbench");
var ctx = cvs.getContext("2d");

var module_manager = new ModuleManager();

var test_module1 = new ArgModule({x:100,y:100}, "log", "none" , 0,"HI");
var test_module2 = new ArgModule({x:200,y:200}, "log", "none" , 0,"HO")

module_manager.add_module(test_module1);
module_manager.add_module(test_module2);

var mouseX;
var mouseY;

var moving = [];

cvs.addEventListener("mousemove",function(event){
		module_manager.move_modules(event.clientX,event.clientY);
	});
cvs.addEventListener("mousedown",function(event){
		module_manager.click_modules(event.clientX,event.clientY);
	});
cvs.addEventListener("mouseup",function(event){
		module_manager.release_modules();
	});


function update(){
	
	module_manager.draw(ctx);
}

export{

}