var codes ={
	"movement":{
		"rndir":"target.dir=Math.floor(Math.random()*100)%4;",
		"move":"target.forward();",
		"turn":"target.turn_clock();",
	},
	"condition":{
		"ifwall":"target.colision(this.map);",
		"facenop":"target.dir==map.dir_nop(target.position.x,target.position.y)",
		"nopdistless":"map.dist_nop(target.position.x,target.position.y)<$val$"
	},
	"control":{
		"log":"console.log('$arg$');"
	}
}

var styles = {
	"control":"#0000FF",
	"condition":"#999999",
	"movement":"#FF0000",
	"target":"#AAFFAA"
	}

const MODULESIZE = 25;

export{
	codes,
	styles,
	MODULESIZE
}