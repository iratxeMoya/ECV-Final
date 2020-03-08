var codes ={
	"movement":{
		"rndir":"target.dir=Math.floor(Math.random()*100)%4;",
		"move":"target.forward();",
		"turn":"target.turn_clock();",
		"facenop":"map.dir_nop(target.position.x,target.position.y)"
	},
	"condition":{
		"ifwall":"target.colision(this.map);",
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