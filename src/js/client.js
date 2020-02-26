import { Module } from 'module.js';
import { codes } from 'codes.js';

var modules = document.getElementsByClassName("module");
var updater = setInterval(update, 50);

var cvs = document.getElementById("workbench");
var ctx = cvs.getContext("2d");

var test_module1 = new ArgModule({x:100,y:100}, "log", "none" , 0,"HI");

var test_module2 = new ArgModule({x:200,y:200}, "log", "none" , 0,"HO")


var mouseX;
var mouseY;

var moving = [];

for (i=0;i<modules.length;i++){
	moving[i]=false; 
	let module = modules[i];
	document.addEventListener("mousemove",function(event){
		idx = modules.findIndex(module);
		if(moving[i]){
			module.style.left = event.clientX;;
			module.style.top = event.clientY;
			module.style.transform = "translate(-50%, -50%)";
		}
	});

	module.addEventListener("mousedown",function(event){
		console.log("AS");
		ev= event
		moving = true;
	});
	module.addEventListener("mouseup",function(event){
		moving = false;
		console.log("HA");	
	});
}

function update(){
	console.log("A");
	ctx.rect(20, 20, 150, 100);
	
}

export{

}