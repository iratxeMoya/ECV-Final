import { codes, styles,MODULESIZE } from './codes.js';

class Map{
	constructor(sizex,sizey){
		this.sizex=sizex;
		this.sizey=sizey;
		this.matrix = [];
		for (var i = 0; i < sizey; ++i){
			this.matrix.push(zeros(sizex));
			if(i==0||i==sizey){
				this.matrix[i].fill(-1);
			}else{
				this.matrix[i][0]=-1;
				this.matrix[i][sizex-1]=-1;
			}
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