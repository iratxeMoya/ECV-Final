var codes ={
	"ifwall":"target.colision(this.map);",
	"log":"console.log('$arg$');",
	"move":"target.forward();",
	"turn":"target.turn_clock();"
	}

var styles = {
	"log":"#0000FF",
	"ifwall":"#999999",
	"move":"#FF0000",
	'target': '#00FF00',
	'turn':'#0000FF'
	}

const MODULESIZE = 25;

export{
	codes,
	styles,
	MODULESIZE
}