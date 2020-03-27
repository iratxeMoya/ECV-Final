import { codes, styles } from './codes.js';
import { ELEMENTSIZE, TILENUM } from './client.js';

class Map {

	constructor(sizex,sizey) {

		this.sizex=sizex;
		this.sizey=sizey;
		this.matrix = [];

		for(var i = 0; i < this.sizey; i++) {

			let arr = [];

			for(var j = 0; j < this.sizex; j++) {

				if(i == 0 || i == sizey - 1 || j == 0 || j == sizex - 1) {

					arr.push(-1);

				}
				else {

					arr.push(0);

				}

			}

			this.matrix.push(arr);
		}
	}
	
	is_valid(x, y) {

		console.log(x, y, TILENUM)
		return (x < TILENUM && y < TILENUM && x > 0 && y > 0);

	}
	
	nearest_op(x, y) {

		var found = false;
		var i = x;
		var j = y;
		var depth = 0;
		var cnt = 0;
		var round = 4;
		var movex =- 1;
		var movey = 0;
		var ret = -1;

		while (depth < this.sizex - 1) {

			if(i >= 0 && j >= 0 && i < this.sizex && j < this.sizey) {

				found = this.matrix[j][i] > 0 && x !== i && y !== j;

			}
			if(found) {

				return {"x": i, "y": j};

			} 
			if(cnt == depth && round > 3) {

				i++;
				j++;
				cnt = 0;
				depth += 2;

			}
			else if(cnt == depth ) {

				movey = (-1)*ret - movey;
				movex = (-1)*ret + movex;
				ret = movex - movey;
				round++;
				cnt = 0;

			}

			i += movex;
			j += movey;
			cnt++;

		}

		return null;

	}
	
	dist_nop(x, y) {

		var op = this.nearest_op(x, y);

		if(op) {

			return Math.floor(Math.sqrt((x - op.x) * (x - op.x) + (y - op.y) * (y - op.y)));

		}

		return null;

	}
	
	face_nop(x, y) {

		var op = this.nearest_op(x, y);

		if(op) {

			return (Math.abs(x - op.x) > Math.abs(y - op.y) ? (x > op.x ? 2 : 0) : (y > op.y ? 3 : 1));

		}
		return 0;

	}
	
	draw(ctx) {

		for(var i = 0; i < this.sizey; i++) {

			for(var j = 0; j < this.sizex; j++) {

				ctx.fillStyle = (i+j)%2==0 ? '#CCCCCD' : '#DDDDDD';
				ctx.fillRect((j) * ELEMENTSIZE, (i)* ELEMENTSIZE, ELEMENTSIZE, ELEMENTSIZE);

			}
		}
	}
}

export {
	Map
}