import { Module,ArgModule,ModuleManager } from './module.js';
import { codes } from './codes.js';

var modules = document.getElementsByClassName("module");
var updater = setInterval(update, 50);

var cvs = document.getElementById("workbench");
var ctx = cvs.getContext("2d");

var module_manager = new ModuleManager();

var test_module1 = new ArgModule({x:100,y:100}, "log", "none" , 0,"HI");
var test_module2 = new ArgModule({x:200,y:200}, "log", "none" , 0,"HO")

var workbench = document.getElementsByClassName("user_screen")[0];

var wb_h =window.getComputedStyle(workbench).height;
var wb_w =window.getComputedStyle(workbench).width;

module_manager.add_module(test_module1);
module_manager.add_module(test_module2);

cvs.height=wb_h;
cvs.width=wb_w;

var mouseX;
var mouseY;

var moving = [];

cvs.addEventListener("mousemove",function(event){
		mouseX=event.clientX;
		mouseY=event.clientY;
		module_manager.move_modules(event.clientX,event.clientY);
	});
cvs.addEventListener("mousedown",function(event){
		module_manager.click_modules(event.clientX,event.clientY);
	});
cvs.addEventListener("mouseup",function(event){
		module_manager.release_modules();
	});


function update(){
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, wb_w, wb_h);
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(mouseX, mouseY, 5, 5);
	module_manager.draw(ctx);
}

export{

}