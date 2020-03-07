var codes ={"ifwall":"!(target.in_range(target.next_pos(),100,400,100,400))","log":"console.log('$arg$');","move":"target.forward();","turn":"target.turn_clock();"}

var styles = {"log":"#0000FF","ifwall":"#999999","move":"#FF0000", 'target': '#00FF00','turn':'#0000FF'}

export{
	codes,
	styles
}