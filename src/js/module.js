import { connection } from './init.js';
import { codes, styles } from './codes.js';

var activeModuleIds = [];
var deletingModuleIds = [];
var exe_parameters={};

const MODULESIZE =25;


class Element {
	
	constructor (id,position, avatar = null) {
		
		this.parameters={'posx':position.x,'posy':position.y,'sizex':MODULESIZE,'sizey':MODULESIZE}
		this.id = id;
		
		
	}
	
	draw(gs_ctx){
		gs_ctx.fillStyle = '#00FF00';
        gs_ctx.fillRect(this.parameters.posx-this.parameters.sizex/2,this.parameters.posy-this.parameters.sizey/2, this.parameters.sizex,this.parameters.sizey);
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
    constructor (position, type, id, next, prev) {

        this.position = position;
		this.type = type;
        this.id = id;
        this.prev = prev;
        this.next = next;
        this.moving = false;
        this.offset = 0;

    }

    /**
     * Update the ofset to locate related modules properly
     */
    update_offset(){

        if(typeof this.prev === 'undefined' || this.prev === null) {

            this.offset = 0;

        }
        else {

            this.offset = this.prev.offset + MODULESIZE;

        }
		
		if (this.next) {
			this.next.update_offset()
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

		wb_ctx.fillStyle = styles[this.type]
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

        var jsonData = {};
        jsonData.type = 'relateModules';
        jsonData.id = this.id;
        jsonData.position = this.position;
        jsonData.code = this.code;
        jsonData.before = this.before ? this.before.id : null;
        jsonData.after = this.after ? this.after.id : null;

        console.log('relating: ', jsonData);
        
        connection.send(JSON.stringify(jsonData));

    }
	getMasterPos () {
		
		return this.prev ? this.prev.getMasterPos() : this.position;
		
	}
	
	getTarget(){
		
		return this.prev ? this.prev.getTarget() : (this.type === "target" ? this.target : null);
	}

    /**
     * Runs code of the module
     */
    run () {

        eval(codes[this.type]);
    
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

			if (Math.abs(posx-pos.x) < MODULESIZE / 2 && Math.abs(posy-pos.y) < MODULESIZE / 2 ){
                
				if (module.prev){
					module.prev.next=null;
					module.prev = null;
					module.update_offset();
				}
				
                module.enable_moving();
				
				return;
                
            }

        });

	}
    
    /**
     * Disables mooving any module that has been released. If 2 modules are near, locates one module below the other (related) 
     */
	release_modules() {

        activeModuleIds = [];
		
		console.log('in release ', this.modules)

		this.modules.forEach(module => {

            if (module.moving) {

                this.modules.forEach(nearModule => {

                    if (module.isNear(nearModule) && !module.isParent(nearModule) && !module.isChild(nearModule)) {

                        module.relate(nearModule, "before");
                        module.update_offset();
                        module.position.x = nearModule.getMasterPos().x;
                        module.position.y = nearModule.getMasterPos().y + module.offset;
                        return;

                    }

                });
				
                activeModuleIds.push(module.id);

            }
            
            module.disable_moving();
            
        });
        
	}
    
    /**
     * Moves all modules that are enabled to move to posx, posy position.
     * 
     * @param {int} posx 
     * @param {int} posy 
     */
	move_modules(posx, posy) {

		this.modules.forEach(module => {

			if (module.moving) {

				module.position.x = posx;
                module.position.y = posy + module.offset;
                
			}
        });
       
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
	Element
}
