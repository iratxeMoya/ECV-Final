import { codes, styles } from './codes.js';
import { Map } from './map.js';
import { isHover } from './utils.js';
import { ELEMENTSIZE, MODULESIZE, TILENUM } from './client.js';

var nextElementPos = {x: 2, y: 2};

var element_img = new Image(50, 200);
element_img.src = 'icons/base_element.png';

class Element {
	
	constructor (name, id, position, contestant = false, avatar = null) {

		this.position={x: position.x, y: position.y};
		this.id = id;
		this.dir = 0;
		this.dead = false;
		this.contest= contestant;
		this.name = name;

		console.log('next element pos: ', position);
		if (nextElementPos.x + 2 > TILENUM - 1) {

			nextElementPos.x = 2

			console.log(nextElementPos);
			if (nextElementPos.y + 2 > TILENUM - 1) {

				nextElementPos.y = 2;
	
			}
			else {
	
				nextElementPos.y += 2;
	
			}

		}
		else {

			nextElementPos.x += 2;

		}

    }
	
	forward() {

		switch(this.dir) {

			case 0:

				this.position.x += 1;
				break;

			case 1:

				this.position.y += 1;
				break;

			case 2:

				this.position.x -= 1;
				break;

			default:

				this.position.y -= 1;

		}
	}
	
	in_range(pos, xi, xf, yi, yf) {

		return (pos.x > xi && pos.x < xf && pos.y > yi && pos.y < yf);

	}
	
	turn_clock() {

		this.dir = (this.dir + 1) % 4;

	}
	
	turn_counter() {

		this.dir = (this.dir - 1) % 4;

	}
	
	next_pos() {

		var nposx = this.position.x;
		var nposy = this.position.y;

		switch(this.dir) {

			case 0:

				nposx += 1;
				break;

			case 1:

				nposy += 1;
				break;

			case 2:

				nposx -= 1;
				break;

			default:

				nposy -= 1;

		}

		return {x: nposx, y: nposy};

	}
	
	draw(gs_ctx) {
		 gs_ctx.globalCompositeOperation = "multiply";
		 gs_ctx.fillStyle = '#FF6DC9';
		 gs_ctx.fillRect((this.position.x - 1) * ELEMENTSIZE, (this.position.y - 1) * ELEMENTSIZE, ELEMENTSIZE, ELEMENTSIZE);
		gs_ctx.drawImage(element_img, 0, 0,50,50,(this.position.x - 1) * ELEMENTSIZE,(this.position.y - 1) * ELEMENTSIZE,ELEMENTSIZE,ELEMENTSIZE);
		
	}
	
	colision(map) {

		let npos = this.next_pos();
		return !map.is_valid(npos.x, npos.y);

	}
	
}

class ElementManager {

    constructor () {

        this.elements = [];
		this.contestant = null;

    }

    add_element (element) {

		this.elements.push(element);
		
    }

    delete_element (element) {

		this.elements.remove(element);
		
    }

    getElementById (id) {

		let ret = this.elements.filter(ele => ele.id.toString() === id.toString());

		return ret;
		
	}
	
	move_element (id, position) {

		let idx = this.elements.findIndex(e => e.id.toString() === id.toString()); 
		console.log('index: ', idx)
		this.elements[idx].position = position;

	}
	
	refresh() {

		this.elements.forEach(element => {
			element.dead = false;
		});

	}
	
	any_alive() {

		var ret = true;

		this.elements.forEach(element => {

			ret = ret && !element.dead;

		});

		return ret;

	}

    draw (gs_ctx) {

        this.elements.forEach(element => {

			element.draw(gs_ctx);
			
		})
		
    }
	
	end_contest() {

		for( let i = 0; i < this.elements.length; i++) {

			if(this.elements[i].contest) {

				this.elements.splice(i);

			}
		}

		for (let i = 0; i < this.elements.length; i++) {

			this.elements[i].position.x = Math.floor(TILENUM / 2);
			this.elements[i].position.y = Math.floor(TILENUM / 2);

		}

	}

	reset() {

		var x = 0;
		var y = 0;

		for (let i = 0; i < this.elements.length; i++) {

			if (x + 2 > TILENUM - 1) {
				x = 2;
				if (y + 2 > TILENUM - 1) {
					y = 2;
				}
				else {
					y += 2;
				}
			}
			else {
				x += 2;
			}
			console.log('reset: ', x, y, TILENUM);
			this.elements[i].position.x = x
			this.elements[i].position.y = y;
			this.elements[i].dead = false;
			this.elements[i].dir = 0;

		}

	}
    
}

class Module {

    
    constructor (position, moduleType,codeType, id, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {

        this.position = position;
		this.moduleType = moduleType;
		this.codeType=codeType;
		this.superparentId = id;
        this.id = id;
        this.siblings = {
			 'north': {node: null, type: false},
			 'south': {node: null, type: false},
			 'east' : {node: null, type: false},
			 'west' : {node: null, type: false},
		};

		this.relative={dir: null, offset: {x: 0, y: 0}};

		if (north.node) {
			this.assemble(north.node, 'north', north.type)
		}
		if (west.node) {
			this.assemble(west.node, 'west', west.type)
		}
		if (east.node) {
			this.assemble(east.node, 'east', east.type)
		}
		if (south.node) {
			this.assemble(south.node, 'south', south.type)
		}

    }
	
	get_offset() {

		if (!this.relative.dir) {

            return {x: 0, y: 0};
            
        }
        else {
			var offset = this.siblings[this.relative.dir].node.get_offset();
			offset.x += this.relative.offset.x;
			offset.y += this.relative.offset.y;
			return offset; 
		}
	}
	
	oposite(dir) {

		switch(dir) {

				case 'north':
                    
                    return 'south';
                    
				case 'south':

                    return 'north';
                    
				case 'east':

                    return 'west';
                    
				case 'west':

                    return 'east';
                    
				default:

                    return null;
                    
			}
	}
	
	assemble(node, direction, type) {
	
        this.relative.dir = direction;
        this.update_superparentId(node.superparentId);
		switch(direction) {

			case 'north':

				this.siblings.north.node = node;
				this.siblings.north.type = type;
				node.siblings.south.node = this;
				node.siblings.south.type = !type;
				this.relative.offset.x = 0;
				this.relative.offset.y = MODULESIZE;
	
                break;
                			
			case 'east':

				this.siblings.east.node = node;
				this.siblings.east.type = type;
				node.siblings.west.node = this;
				node.siblings.west.type = !type;
				this.relative.offset.x = -MODULESIZE;
				this.relative.offset.y = 0;
                break;
                
			case 'west':

				this.siblings.west.node = node;
				this.siblings.west.type = type;
				node.siblings.east.node = this;
				node.siblings.east.type = !type;
				this.relative.offset.x = MODULESIZE;
				this.relative.offset.y = 0;
                break;
                
			default:

				this.siblings.south.node = node;
				this.siblings.south.type = type;
				node.siblings.north.node = this;
				node.siblings.north.type = !type;
				this.relative.offset.x = 0;
				this.relative.offset.y = -MODULESIZE;
				break;
        }
        
		let mp = this.getMasterPos();
		this.move(mp.x, mp.y);
		
	}
	
	disassemble() {
        
		this.siblings[this.relative.dir].node.siblings[this.oposite(this.relative.dir)].node = null;
		this.siblings[this.relative.dir].node = null;
		this.relative.dir = null;
		this.update_superparentId(this.id);
		this.relative.offset.x = 0;
		this.relative.offset.y = 0;
	}
	
	update_superparentId(id) {

		this.superparentId = id

		for(let dir in this.siblings) {

			if (dir !== this.relative.dir && this.siblings[dir].node) {

                this.siblings[dir].node.update_superparentId(id);
                
			}
		}
	}
	
	change_gate(dir, type = !this.siblings[dir].type){

		this.siblings[dir].type = type;

	}

    /**
     * Update the ofset to locate related modules properly
     */
    update_offset() {
		
        if (typeof this.prev === 'undefined' || this.prev === null) {

            this.offset.x = 0;
            this.offset.y = 0;

        }
        else {

            this.offset = this.prev.offset + MODULESIZE;

        }
		
		if (this.next) {

            this.next.update_offset();
            
		}

    }
	
	move(x, y) {

		let offset = this.get_offset();
		this.position.x = x + offset.x;
        this.position.y = y + offset.y;
        
		for(let dir in this.siblings) {

			if (dir !== this.relative.dir && this.siblings[dir].node) {

                this.siblings[dir].node.move(x, y);
                
			}
		}
    }

	enable_moving() {

        this.moving = true;
		this.next ? this.next.enable_moving() : null;
        
    }
    
	disable_moving() {

        this.moving = false;
        
	}
    
	draw(wb_ctx) {

		wb_ctx.fillStyle = styles[this.moduleType];
        wb_ctx.fillRect(this.position.x-MODULESIZE/2,this.position.y-MODULESIZE/2, MODULESIZE,MODULESIZE);
		wb_ctx.fillStyle = "#FFFFFF";
        wb_ctx.font = MODULESIZE+"px Georgia";
		wb_ctx.fillText(this.codeType.charAt(0).toUpperCase(), this.position.x-MODULESIZE/2, this.position.y+MODULESIZE/2);
	}

    isNear(module) {

		return Math.abs(module.position.x - this.position.x) < MODULESIZE * 2 && Math.abs(module.position.y - this.position.y) < MODULESIZE * 2;  
		
    }
	
	run_children(target) {

		var ret = target;

		for (let dir in this.siblings) {

			if(this.siblings[dir].node && this.siblings[dir].type) {

				ret = this.siblings[dir].node.run(target);

			}	

		}

		return ret;

	}
	
	isChild(module) {
		
		return this.id === module.id ? true : (this.next ? this.next.isChild(module) : false) ;
	
	}
	
	isParent(module) {
		
		return this.id === module.id ? true : (this.prev ? this.prev.isParent(module) : false) ;
	
	}
   
	getMasterPos () {
		
		return this.relative.dir ? this.siblings[this.relative.dir].node.getMasterPos() : this.position;
		
	}
	
	getTarget(){
        
		var ret = this.relative.dir ? this.siblings[this.relative.dir].node.getTarget() : (this.type === "target" ? this.target : null);
		return ret;
	}
	
	get_children_ids(ids) {

		ids.push(this.id);

		for (let dir in this.siblings) {

			if(this.siblings[dir].node && dir !== this.relative.dir) {

				this.siblings[dir].node.get_children_ids(ids);

			}

		}

	}
	
	destroy() {
		for (let dir in this.siblings) {

			if(this.siblings[dir].node && dir !== this.relative.dir) {

				this.siblings[dir].node.destroy();
				delete this.siblings[dir].node;

			}

		}

	}

    run (target) {

		if(target) {

			eval(codes[this.moduleType][this.codeType]);

		}

		return this.run_children(target);

    }
}

class ArgModule extends Module {

	constructor (position, moduleType, type, id, arg, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {

		super(position, moduleType, type, id, north, west, east, south);
        this.arg = arg;
        
    }
    
	set_arg(arg){

		this.arg = arg;
	}
	
	run(target) {

        eval(codes[this.moduleType][this.codeType].replace('$arg$', this.arg)); 
		return this.run_children(target);
		
    }
}

class TargetModule extends Module{

	constructor(position, moduleType,codeType, target, id, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {
        
		super(position, moduleType, codeType, id, north, west, east, south);

		this.target = target;
		this.executed = false;
		
	}
	
	run(target = null) {

		return this.run_children(this.target);
		 
	}
	
}

class ConditionModule extends Module {
	
	constructor(position, moduleType, type, id,map, value=null, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}){

		super(position, moduleType, type, id, north, west, east, south);
		this.value = value;
		this.map = map;

	}
	
	run(target) {
		
		this.value = 5;//DEBUGGING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		if (target) {

			if (eval(codes[this.moduleType][this.codeType].replace('$val$', this.value))) {

				this.change_gate('east', true);
				this.change_gate('west', false);
				
			}
			else {

				this.change_gate('east', false);
				this.change_gate('west', true);
				
			}

			return this.run_children(target);	
		}
	}
	
}

class ModuleManager {

	constructor() {
		this.modules = [];
		this.count = 0;
		this.selectedGroup = null;
		this.running = false;
		this.everyone_ready=false;
		this.ret={status:-1,mod:null,id:null};
    }
    
	add_module(newModule) {

		this.modules.push(newModule)
    }
    
    delete_module (x, y) {

		this.modules.forEach(module => {
			if (isHover(x, y)) {
				this.modules.remove(module);
			}
		})

    }
	
	remove_modules(module) {

		let ids=[];
		module.get_children_ids(ids);

		ids.forEach(id => {

			this.modules.remove(this.getModuleByID(id));

		});

		return ids;
	}
    
	click_modules(posx, posy) {

		this.modules.forEach(module => {

			let pos = module.position;

			if (Math.abs(posx-pos.x) < MODULESIZE / 2 && Math.abs(posy-pos.y) < MODULESIZE / 2 ) {
                
				if (module.relative.dir){

                    module.disassemble();
                    
                }
                
				this.selectedGroup = module;

				return;
            }

        });

	}
    
	closest_node(x, y, radius) {

        var minModule = {position: {x: 1000, y: 1000}};
        
		this.modules.forEach(module => {

			let nval = Math.abs(x - module.position.x) + Math.abs(y - module.position.y);
            let pval = Math.abs(x - minModule.position.x) + Math.abs(y - minModule.position.y);
            
            minModule = nval < pval && module.position.x !== x && module.position.y !== y ? module : minModule;
            
        });
        
        return Math.abs(x - minModule.position.x) + Math.abs(y - minModule.position.y) <= radius ? minModule : null;
        
	}
	
	release_modules() {

		if(this.selectedGroup) {
	
			var nearModule = this.closest_node(this.selectedGroup.position.x,this.selectedGroup.position.y,MODULESIZE*2);
			
			if (nearModule  && this.selectedGroup.moduleType!=="target") {

				if (Math.abs(nearModule.position.x - this.selectedGroup.position.x) > MODULESIZE){

					if (nearModule.position.x > this.selectedGroup.position.x && !nearModule.siblings.west.node && this.selectedGroup.superparentId !== nearModule.superparentId) {

                        this.selectedGroup.assemble(nearModule, 'east', false);
                        
                    }
                    else if (!nearModule.siblings.east.node && this.selectedGroup.superparentId !== nearModule.superparentId){

                        this.selectedGroup.assemble(nearModule, 'west', false);
                        
					}
                }
                else {

					if (nearModule.position.y > this.selectedGroup.position.y && !nearModule.siblings.north.node && this.selectedGroup.superparentId !== nearModule.superparentId) {

                        this.selectedGroup.assemble(nearModule, 'south', false);
                        
                    }
                    else if (!nearModule.siblings.south.node && this.selectedGroup.superparentId !== nearModule.superparentId) {

                        this.selectedGroup.assemble(nearModule, 'north', false);
                        
					}
				}
            }
            
			this.selectedGroup = null;
		}
        
    }
    
    getModuleByID (id) {

        return this.modules.filter(mod => mod.id === id)[0];

    }

	move_modules(posx, posy) {

		this.selectedGroup ? this.selectedGroup.move(posx, posy) : null;
       
	}
    
	draw(wb_ctx) {


		this.modules.forEach(module => {

            module.draw(wb_ctx);
            
		});
	}
    
    run_request(id) {

		this.waiting = id;

	}
	
	server_run(id = this.ret.id) {

		console.log('serverRun: ', this.ret, id)

		if (!this.ret.id) {

			this.ret.id = id;
			return null;

		}
		else {

			this.ret.mod = this.modules.find(module=> (module.moduleType === "target" ? (module.target.id.toString() === id.toString()) : false));
			let ntarget = this.ret.mod.run();

			console.log("serverRun: ", ntarget);
			
			return ntarget;

		}
	}

	run_modules() {

		if (this.running) {

			this.modules.forEach(module => {

				module.moduleType === "target" ? (!module.target.dead ? module.run() : null) : null;

			});
		}
	}
}

Array.prototype.remove = function() {

    var what, a = arguments, L = a.length, ax;

    while (L && this.length) {

        what = a[--L];

        while ((ax = this.indexOf(what)) !== -1) {

            this.splice(ax, 1);

        }

    }

    return this;

};

export {
	Module,
	ConditionModule,
	ArgModule,
	TargetModule,
    ModuleManager,
    Element, 
	ElementManager,
	nextElementPos,
}
