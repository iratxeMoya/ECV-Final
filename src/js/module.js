import { codes, styles,MODULESIZE } from './codes.js';
import { Map } from './map.js';

var activeModuleIds = [];
var deletingModuleIds = [];


class Element {
	
	constructor (id, position, avatar = null,map) {
		console.log(position);
		this.position={x:position.x,y:position.y};
		this.map=map;
		this.id = id;
		this.dir = 0;
		
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
        gs_ctx.fillRect((this.position.x)*MODULESIZE,(this.position.y)*MODULESIZE, MODULESIZE,MODULESIZE);
	}
	
	colision(){
		console.log(map);
		let npos = this.next_pos();
		return !this.map.is_valid(npos.x,npos.y);
	}
	
}

class ElementManager {

    constructor () {
        this.elements = [];
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

    draw (gs_ctx) {
        this.elements.forEach(element => {
            element.draw(gs_ctx);
        })
    }

    
}

class Module {

    
    constructor (position, type, id, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {

        this.position = position;
		this.type = type;
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
    
    isActive() {

        activeModuleIds = [];

        for(let dir in this.siblings) {

			if (dir !== this.relative.dir && this.siblings[dir].node) {

				activeModuleIds.push(this.siblings[dir].node.id);
                
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

		wb_ctx.fillStyle = styles[this.type];
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

    /**
     * Runs code of the module
     */
    run (target = null) {
		console.log(target);
		target = target ? target:this.getTarget();
		console.log(target);
		if(target){
			eval(codes[this.type]);
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
	constructor (position, type, id, arg, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {

		super(position, type, id, north, west, east, south);
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
        eval(codes[this.type].replace('$arg$', this.arg)); 
        this.run_children(target);
        
    }
}

class TargetModule extends Module{

	constructor(position, target, id, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}) {
        
		super(position, "target", id, north, west, east, south);

		this.target = target;
		this.executed = false;
		
	}
	
	run(target = null){
		this.run_children(this.target);
	}
	
}

class ConditionModule extends Module {
	
	constructor(position, type, id, value=null, north = {node: null, type: false}, west = {node: null, type: false}, east = {node: null, type: false}, south = {node: null, type: false}){
		super(position, type, id, north, west, east, south);
		this.value = value;
	}
	
	run(target = null){
		
        target = target ? target:this.getTarget();
        
			if (target) {

				if (eval(codes[this.type].replace('$val$', this.value))) {

					this.change_gate('east', true);
                    this.change_gate('west', false);
                    
                }
                else {

					this.change_gate('east', false);
                    this.change_gate('west', true);
                    
				}

			this.run_children();	
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
    delete_module () {

        deletingModuleIds = [];

        this.modules.forEach(module => {

			if (module.moving) {

                deletingModuleIds.push(module.id);
                this.modules.remove(module);
                 
			}
        });

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
            this.selectedGroup.isActive();
			
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

        return this.modules.filter(mod => mod.id === id);

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
    
    /**
     * Runs the code of all the modules in the manager
     */
	run_modules() {
		if (this.running){
			this.modules.forEach(module => {
				
				module.type === "target" ? module.run() : null;

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
    activeModuleIds,
    deletingModuleIds,
    Element, 
    ElementManager
}
