import { connection } from './init.js';
import { codes, styles } from './codes.js';

var activeModuleIds = [];
var deletingModuleIds = [];

const MODULESIZE =25;


class Element {
	
	constructor (id, position, avatar = null) {
		
		this.parameters={'posx':position.x,'posy':position.y,'sizex':MODULESIZE,'sizey':MODULESIZE}
		this.id = id;
		
    }
	
	draw(gs_ctx){
		gs_ctx.fillStyle = '#00FF00';
        gs_ctx.fillRect(this.parameters.posx-this.parameters.sizex/2,this.parameters.posy-this.parameters.sizey/2, this.parameters.sizex,this.parameters.sizey);
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

    getInfoJson () {
        var json = {};

        this.elements.forEach(element => {
            json[element.id.toString()] = {
                id: element.id,
                posx: element.position.x,
                posy: element.position.y,
                objectType: 'element'
            };
        });
        return json;
    }

    
}

class Module {

    /**
     * 
     * @param {Object} position {x, y}
     * @param {String} code 
     * @param {Module} target ???? 
     * @param {Int} id Unique ??????? no se como hacer esto
     */
    constructor (position, type, id) {

        this.position = position;
		this.type = type;
        this.id = id;
        this.siblings ={
			 'north':{'node':null,'type':false},
			 'south':{'node':null,'type':false},
			 'east' :{'node':null,'type':false},
			 'west' :{'node':null,'type':false},
		};
        this.relative={dir:null,offset:{x:0,y:0}};

    }
	
	get_offset(){
		this.relative.dir ? this.siblings[this.relative.dir].get_offset() + this.relative.offset : 0;
	}
	
	oposite(dir){
		switch(dir){
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
	
	assemble(node,direction,type){
		this.relative.dir = direction;
		switch(direction){
			case 'north':
				this.siblings.north.node = node;
				this.siblings.north.type = type;
				node.siblings.south.node = this;
				node.siblings.south.type = !type;
				this.relative.offset.x=0;
				this.relative.offset.y=MODULESIZE;
	
				break;			
			case 'east':
				this.siblings.east.node = node;
				this.siblings.east.type = type;
				node.siblings.west.node = this;
				node.siblings.west.type = !type;
				this.relative.offset.x=-MODULESIZE;
				this.relative.offset.y=0;
				break;
			case 'west':
				this.siblings.west.node = node;
				this.siblings.west.type = type;
				node.siblings.east.node = this;
				node.siblings.east.type = !type;
				this.relative.offset.x=MODULESIZE;
				this.relative.offset.y=0;
				break;
			default:
				this.siblings.south.node = node;
				this.siblings.south.type = type;
				node.siblings.north.node = this;
				node.siblings.north.type = !type;
				this.relative.offset.x=0;
				this.relative.offset.y=-MODULESIZE;
				break;
		}
		this.position.x = this.siblings[this.relative.dir].node.position.x + this.relative.offset.x;
		this.position.y = this.siblings[this.relative.dir].node.position.y + this.relative.offset.y;
	}
	
	disassemble(){
		this.siblings[this.relative.dir].node.siblings[this.oposite(this.relative.dir)].node=null;
		this.siblings[this.relative.dir].node = null;
		this.relative.dir=null;
		this.relative.offset.x=0;
		this.relative.offset.y=0;
	}

    /**
     * Update the ofset to locate related modules properly
     */
    update_offset(){
		
		
		
        if(typeof this.prev === 'undefined' || this.prev === null) {

            this.offset.x = 0;
            this.offset.y = 0;

        }
        else {

            this.offset = this.prev.offset + MODULESIZE;

        }
		
		if (this.next) {
			this.next.update_offset()
		}

    }
	
	move(x,y){
		this.position.x=x+this.relative.offset.x;
		this.position.y=y+this.relative.offset.x;
		for(let dir in this.siblings){
			console.log(dir);
			if (dir !== this.relative.dir && dir.node){
				console.log("MIASU");
				dir.node.move(x,y);
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
	
	isChild(module) {
		
		return this.id === module.id ? true : (this.next ? this.next.isChild(module) : false) ;
	
	}
	
	isParent(module) {
		
		return this.id === module.id ? true : (this.prev ? this.prev.isParent(module) : false) ;
	
	}

    /**
     * 
     * @param {Module} module 
     * @param {String} position before / after
     */
    relate(module, position) {

        if (position === 'before') {
			
			this.prev = module;
			module.next = this;
			

        } 
        else {

            this.next = module;
			module.prev = this;

        }

    }
	getMasterPos () {
		
		return this.prev ? this.prev.getMasterPos() : this.position;
		
	}
	
	getTarget(){
        
        console.log('getting target ', this)
		var ret =this.relative.dir ? this.siblings[this.relative.dir].node.getTarget() : (this.type === "target" ? this.target : null);
		console.log(ret);
		return ret;
	}

    /**
     * Runs code of the module
     */
    run () {
		if(this.getTarget()){
			eval(codes[this.type]);
		}
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
	constructor (position, type, id, arg, next = null, prev = null) {

		super(position, type, id, next, prev);
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
	
	run() {

        eval(codes[this.type].replace('$arg$', this.arg)); 

    }
}

class TargetModule extends Module{
	constructor(position, target, id, next = null, prev = null) {
		super(position, "target", id, next, prev);
		console.log('in target module ', id);

		this.target = target;
		this.executed = false;
		
	}
	
	run(){
	}
	
}

class ModuleManager {

    /**
     * Creates a module manager object
     */
	constructor() {

		this.modules = [];
		this.count = 0;
		this.selectedGroup=null;
    }
    
    /**
     * Adds a new module to the manager
     * 
     * @param {Module} newModule 
     */
	add_module(newModule) {

        console.log(newModule)

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

			if (Math.abs(posx-pos.x) < MODULESIZE / 2 && Math.abs(posy-pos.y) < MODULESIZE / 2 ){
                
				if (module.relative.dir){
					module.disassemble();
				}
				this.selectedGroup=module;
				console.log(this.selectedGroup);
				return;
            }

        });

	}
    
	closest_node(x,y,radius){
		var minModule={position:{x:1000,y:1000}};
		this.modules.forEach(module => {
			let nval =Math.abs(x-module.position.x)+Math.abs(y-module.position.y);
			let pval =Math.abs(x-minModule.position.x)+Math.abs(y-minModule.position.y);
			minModule = nval<pval && module.position.x!==x && module.position.y !==y ? module : minModule;
		});
		return Math.abs(x-minModule.position.x)+Math.abs(y-minModule.position.y) <=radius ? minModule : null;
	}
	
    /**
     * Disables mooving any module that has been released. If 2 modules are near, locates one module below the other (related) 
     */
	release_modules() {
		if(this.selectedGroup){
			
			var nearModule = this.closest_node(this.selectedGroup.position.x,this.selectedGroup.position.y,MODULESIZE*2);
			console.log(nearModule);
			if (nearModule){
				
				this.selectedGroup.assemble(nearModule,'north',true);
				this.selectedGroup=null;
				
			}else{
				this.selectedGroup=null;
			}
		}
        // activeModuleIds = [];

		// this.modules.forEach(module => {

            // if (module.moving) {

                // this.modules.forEach(nearModule => {

                    // if (module.isNear(nearModule) && !module.isParent(nearModule) && !module.isChild(nearModule)) {

                        // module.relate(nearModule, "before");
                        // module.update_offset();
                        // module.position.x = nearModule.getMasterPos().x;
                        // module.position.y = nearModule.getMasterPos().y + module.offset;
                        // return;

                    // }

                // });
				
                // activeModuleIds.push(module.id);

            // }
            
            // module.disable_moving();
            
        // });
        
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

		this.selectedGroup ? this.selectedGroup.move(posx,posy) : null;
       
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

		this.modules.forEach(module => {

            module.run(this.codedata);

		});
    }
    
    getInfoJson () {

        var json = {};

        this.modules.forEach(module => {
            json[module.id.toString()] = {
                id: module.id,
                type: module.type,
                prev: module.prev ? module.prev.id : null,
                next: module.next ? module.next.id : null,
                posx: module.position.x,
                posy: module.position.y,
                objectType: 'module',
            };
        });

        return json;

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
	ArgModule,
	TargetModule,
    ModuleManager,
    activeModuleIds,
    deletingModuleIds,
    Element, 
    ElementManager
}
