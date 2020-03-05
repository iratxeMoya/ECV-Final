var codes ={"ifwall":"this.getTarget[0].parameters.posx>200","log":"console.log('$arg$');","move":"this.getTarget()[0].parameters.posx = this.getTarget()[0].parameters.posx+10;"}

var styles = {"log":"#0000FF","ifwall":"#999999","move":"#FF0000", 'target': '#00FF00'}

export{
	codes,
	styles
}