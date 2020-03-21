import { codes, styles,MODULESIZE } from './codes.js';
import { Map } from './map.js';
import { isHover } from './utils.js'


class Element {
	
	constructor (id, position, avatar = null) {
		//console.log(position);
		this.position={x:position.x,y:position.y};
		this.id = id;
		this.dir = 0;
		this.dead=false;
		
    }
	
	forward(){
		switch(this.dir){
			case 0:
				this.position.x+=1;
				break;
			case 1:
				this.position.y+=1;
				break;
			case 2:
				this.position.x-=1;
				break;
			default:
				this.position.y-=1;
		}
	}
	
	in_range(pos,xi,xf,yi,yf){
		return (pos.x>xi && pos.x<xf && pos.y>yi && pos.y<yf);
	}
	
	turn_clock(){
		this.dir = (this.dir+1)%4;
	}
	
	turn_counter(){
		this.dir = (this.dir-1)%4;
	}
	
	next_pos(){
		var nposx=this.position.x;
		var nposy=this.position.y;
		switch(this.dir){
			case 0:
				nposx+=1;
				break;
			case 1:
				nposy+=1;
				break;
			case 2:
				nposx-=1;
				break;
			default:
				nposy-=1;
		}
		return {x:nposx,y:nposy};
	}
	
	draw(gs_ctx){
		gs_ctx.fillStyle = '#FF6DC9';
        gs_ctx.fillRect((this.position.x-1)*MODULESIZE,(this.position.y-1)*MODULESIZE, MODULESIZE,MODULESIZE);
	}
	
	colision(map){
		//console.log(map);
		let npos = this.next_pos();
		return !map.is_valid(npos.x,npos.y);
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
        return this.elements.filter(ele => ele.id.toString() === id);
    }
	
	move_element (id,position){
		console.log(id);
		console.log(this.elements);
		let idx =this.elements.findIndex(e=>e.id === id);
		this.elements[idx].position = position;
	}
	
	refresh(){
		this.elements.forEach(element => {
			element.dead=false;
		});
	}
	
	any_alive(){
		var ret=true;
		this.elements.forEach(element => {
			ret = ret && !element.dead;
		});
	}

    draw (gs_ctx) {
        this.elements.forEach(element => {
            element.draw(gs_ctx);
        })
    }

    
}

class Module {

    
    constructor (position, moduleType,codeType, id, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {

        this.position = position;
		this.moduleType = moduleType;
		this.codeType=codeType;
        this.id = id;
        this.siblings = {
			 'north': north,
			 'south': south,
			 'east' : east,
			 'west' : west,
		};
        this.relative={dir: null, offset: {x: 0, y: 0}};

    }
	
	get_offset(){
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
		this.relative.offset.x = 0;
		this.relative.offset.y = 0;
	}
	
	change_gate(dir,type = !this.siblings[dir].type){
		this.siblings[dir].type=type;
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

    /**
     * Enable module to move
     */
	enable_moving() {

        this.moving = true;
		this.next ? this.next.enable_moving() : null;
        
    }
    
	/**
     * Disable module to move
     */
	disable_moving() {

        this.moving = false;
        
	}
    
    /**
     * Draw module in canvas
     * 
     * @param {Canvas context} wb_ctx 
     */
	draw(wb_ctx) {

		wb_ctx.fillStyle = styles[this.moduleType];
        wb_ctx.fillRect(this.position.x-MODULESIZE/2,this.position.y-MODULESIZE/2, MODULESIZE,MODULESIZE);
        
	}
    
    /**
     * 
     * @param {Module} module 
     * @returns {boolean} is module near of this?
     */
    isNear(module) {
        return Math.abs(module.position.x - this.position.x) < MODULESIZE * 2 && Math.abs(module.position.y - this.position.y) < MODULESIZE * 2;  
    }
	
	run_children(target=null){
		for (let dir in this.siblings){
			if(this.siblings[dir].node && this.siblings[dir].type){
				this.siblings[dir].node.run(target);
			}				
		}
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
	
	get_children_ids(ids){
		ids.push(this.id);
		for (let dir in this.siblings){
			if(this.siblings[dir].node && dir !== this.relative.dir){
				this.siblings[dir].node.get_children_ids(ids);
			}
		}
	}
	
	destroy(){
		for (let dir in this.siblings){
			if(this.siblings[dir].node && dir !== this.relative.dir){
				this.siblings[dir].node.destroy();
				delete this.siblings[dir].node;
			}
		}
	}
	
    /**
     * Runs code of the module
     */
    run (target = null) {
		//console.log(target);
		target = target ? target:this.getTarget();
		console.log(this.moduleType+" "+this.codeType);
		if(target){
			eval(codes[this.moduleType][this.codeType]);
		}
		this.run_children(target);
    }
}

class ArgModule extends Module {
	/**
     * 
     * @param {Object} position {x, y}
     * @param {String} type 
     * @param {Module} target
     * @param {Int} id Unique ??????? no se como hacer esto
     * @param {String} argument to pass	
     */
	constructor (position, moduleType, type, id, arg, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {

		super(position, moduleType, type, id, north, west, east, south);
        this.arg = arg;
        
    }
    
    /**
     * Sets arguments for code running
     * 
     * @param {String} arg 
     */
	set_arg(arg){

		this.arg = arg;
	}
	
	run(target = null) {

		target = target ? target:this.getTarget();
        eval(codes[this.moduleType][this.codeType].replace('$arg$', this.arg)); 
        this.run_children(target);
        
    }
}

class TargetModule extends Module{

	constructor(position, moduleType,codeType, target, id, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {
        
		super(position, moduleType, codeType, id, north, west, east, south);

		this.target = target;
		this.executed = false;
		
	}
	
	run(target = null){
		this.run_children(this.target);
	}
	
}

class ConditionModule extends Module {
	
	constructor(position, moduleType, type, id,map, value=null, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}){
		super(position, moduleType, type, id, north, west, east, south);
		this.value = value;
		this.map = map;
	}
	
	run(target = null){
		
        target = target ? target:this.getTarget();
        //console.log("COND");
		//console.log(target);
		//console.log(this);
		this.value=5;//DEBUGGING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		if (target) {

			if (eval(codes[this.moduleType][this.codeType].replace('$val$', this.value))) {

				this.change_gate('east', true);
				this.change_gate('west', false);
				
			}
			else {

				this.change_gate('east', false);
				this.change_gate('west', true);
				
			}

			this.run_children(target);	
		}
	}
	
}

class ModuleManager {

    /**
     * Creates a module manager object
     */
	constructor() {
		this.modules = [];
		this.count = 0;
		this.selectedGroup = null;
		this.running = false;
		this.everyone_ready=false;
		this.ret={status:-1,mod:null,id:null};
    }
    
    /**
     * Adds a new module to the manager
     * 
     * @param {Module} newModule 
     */
	add_module(newModule) {

		this.modules.push(newModule)
    }
    
    /**
     * Deletes a module from de manager
     */
    delete_module (x, y) {

		this.modules.forEach(module => {
			if (isHover(x, y)) {
				this.modules.remove(module);
			}
		})

    }
	
	remove_modules(module){
		let ids=[];
		module.get_children_ids(ids);
		//console.log(ids);
		ids.forEach(id =>{
			this.modules.remove(this.getModuleByID(id));
		});
		return ids;
	}
    
    /**
     * Enables moving any module that has been clicked
     * 
     * @param {int} posx 
     * @param {int} posy 
     */
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
	
    /**
     * Disables mooving any module that has been released. If 2 modules are near, locates one module below the other (related) 
     */
	release_modules() {

		if(this.selectedGroup) {
	
			var nearModule = this.closest_node(this.selectedGroup.position.x,this.selectedGroup.position.y,MODULESIZE*2);
			
			if (nearModule) {

				if (Math.abs(nearModule.position.x - this.selectedGroup.position.x) > MODULESIZE){

					if (nearModule.position.x > this.selectedGroup.position.x) {

                        this.selectedGroup.assemble(nearModule, 'east', false);
                        
                    }
                    else {

                        this.selectedGroup.assemble(nearModule, 'west', false);
                        
					}
                }
                else {

					if (nearModule.position.y > this.selectedGroup.position.y) {

                        this.selectedGroup.assemble(nearModule, 'south', false);
                        
                    }
                    else {

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
    
    /**
     * Moves all modules that are enabled to move to posx, posy position.
     * 
     * @param {int} posx 
     * @param {int} posy 
     */
	move_modules(posx, posy) {

		this.selectedGroup ? this.selectedGroup.move(posx, posy) : null;
       
	}
    
    /**
     * Draws all the modules in the manager in the canvas
     * 
     * @param {Canvas context} wb_ctx 
     */
	draw(wb_ctx) {


		this.modules.forEach(module => {

            module.draw(wb_ctx);
            
		});
	}
    
    run_request(id){
		this.waiting = id;
	}
	
	server_run(id=this.ret.id){
		console.log(this.ret);
		if (!this.ret.id){
			this.ret.id = id;
			this.ret.mod =this.modules.find(module=>module.moduleType === "target" && !module.target.dead && module.target.id === id);
			this.ret.mod.run();
			console.log("ID "+id);
			return null;	
		}else{
			this.ret.id = null;
			console.log(this.ret);
			return {id:id,position:this.ret.mod.target.position,dir:this.ret.mod.target.dir}
		}
	}
	
	 /**
     * Runs the code of all the modules in the manager
     */
	run_modules() {
		if (this.running){
			this.modules.forEach(module => {
				module.moduleType === "target" ? (!module.target.dead ? module.run():null) : null;

			});
		}
	}
}



/**
 * Removes element from array
 */
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
    ElementManager
}
