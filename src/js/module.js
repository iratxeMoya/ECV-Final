import { connection } from './init.js';
import { codes, styles } from './codes.js';

var activeModuleIds = [];
var deletingModuleIds = [];
const MODULESIZE =25;
class Module {

    /**
     * 
     * @param {Object} position {x, y}
     * @param {String} code 
     * @param {Module} target ???? 
     * @param {Int} id Unique ??????? no se como hacer esto
     */
    constructor (position, type, target, id, next, prev) {

        this.position = position;
		this.type = type;
        this.target = target;
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

        console.log(this)

        if(typeof this.prev === 'undefined' || this.prev === null) {

            this.offset = 0;

        }
        else {

            this.offset = this.prev.offset + MODULESIZE;

        }

        if(typeof this.next !== 'undefined' || this.next !== null) {

            this.next.update_offset();

        }
    }

    /**
     * Enable module to move
     */
	enable_moving() {

        this.moving = true;
        
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
     * @param {Canvas context} ctx 
     */
	draw(ctx) {

		ctx.fillStyle = styles[this.type]
        ctx.fillRect(this.position.x-MODULESIZE/2,this.position.y-MODULESIZE/2, MODULESIZE,MODULESIZE);
        
	}
    
    /**
     * 
     * @param {Module} module 
     * @returns {boolean} is module near of this?
     */
    isNear(module) {

        return Math.abs(module.position.x - this.position.x) < MODULESIZE * 2 && Math.abs(module.position.y - this.position.y) < MODULESIZE * 2; 

    }

    /**
     * 
     * @param {Module} module 
     * @param {String} position before / after
     */
    relate(module, position) {

        if (position === 'before') {

            this.before = module;

        } 
        else {

            this.after = module;

        }

        var jsonData = {};
        jsonData.type = 'relateModules';
        jsonData.moduleId = this.id;
        jsonData.position = this.position;
        jsonData.code = this.code;
        jsonData.target = this.target ? this.target.id : null;
        jsonData.before = this.before ? this.before.id : null;
        jsonData.after = this.after ? this.after.id : null;
        
        connection.send(JSON.stringify(jsonData));

    }

    /**
     * Runs code of the module
     */
    run () {

        eval(codes[type]);
    
    }
}

class ArgModule extends Module {
	/**
     * 
     * @param {Object} position {x, y}
     * @param {String} type 
     * @param {Module} target ???? 
     * @param {Int} id Unique ??????? no se como hacer esto
     * @param {String} argument to pass	
     */
	constructor (position, type, target, id, arg, next = null, prev = null) {

		super(position, type, target, id, next, prev)
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

			if (pos.x > posx - 10 && pos.x < posx + 10 && pos.y > posy - 10 && pos.y < posy + 10){
                
                module.enable_moving();
                
            }

        });

	}
    
    /**
     * Disables mooving any module that has been released. If 2 modules are near, locates one module below the other (related) 
     */
	release_modules() {

        activeModuleIds = [];

		this.modules.forEach(module => {

            if (module.moving) {

                this.modules.forEach(nearModule => {

                    if (module.isNear(nearModule)&& module !== nearModule) {

                        module.relate(nearModule,"before");
                        module.update_offset();
                        module.position.x = nearModule.position.x;
                        module.position.y = nearModule.position.y + module.offset;
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
     * @param {Canvas context} ctx 
     */
	draw(ctx) {

		this.modules.forEach(module => {

            module.draw(ctx);
            
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
	ArgModule,
    ModuleManager,
    activeModuleIds,
    deletingModuleIds,
}
