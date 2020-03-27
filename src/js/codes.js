var codes = {

	"movement": {

		"rndir":"target.dir=Math.floor(Math.random()*100)%4;",
		"move":"target.forward();",
		"turn_clock":"target.turn_clock();",
		"turn_counter":"target.turn_counter();",

	},
	"condition": {

		"ifwall":"target.colision(this.map);",
		"face_oponent":"target.dir==this.map.face_nop(target.position.x,target.position.y)",
		"oponent_near":"this.map.dist_nop(target.position.x,target.position.y)<5"

	},
	"control": {

		"empty":""

	}
}

var styles = {
	"control":"#0000FF",
	"condition":"#999999",
	"movement":"#FF0000",
	"target":"#88CC88"
	}


export {
	codes,
	styles
}