import { codes, styles,MODULESIZE } from './codes.js';

class Map{
	constructor(sizex,sizey){
		this.sizex=sizex;
		this.sizey=sizey;
		this.matrix = [];
		for(var i =0;i<this.sizey;i++){
			let arr =[]
			for(var j =0;j<this.sizex;j++){
				if(i==0||i==sizey || j==0||j==sizex){
					arr.push(-1);
				}else{
					arr.push(0);
				}
			}
			this.matrix.push(arr);
		}
	}
	
	is_valid(x,y){
		return this.matrix[y][x]>0;
	}
	
	draw(ctx){
		for(var i =0;i<this.sizey;i++){
			for(var j =0;j<this.sizex;j++){
				gs_ctx.fillStyle = (i+j)%2==0 ? '#AAAAAA' : '#DDDDDD';
				gs_ctx.fillRect(j*MODULESIZE,i*MODULESIZE, MODULESIZE,MODULESIZE);
			}
		}
	}
}

export{
	Map
}