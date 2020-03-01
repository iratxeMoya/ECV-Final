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
        this.before = prev;
        this.after = next;
        this.moving = false;

        console.log('creating: ', position);

    }
    /**
     * 
     * @param {Object} newPosition {x, y}
     * 
     * Moves the Module to a new position in the Canvas
     */
    move (newPosition) {
        this.position = newPosition;
        // aqui hacer lo que haya que hacer para moverlo en el canvas ????

        var jsonData = {};
        jsonData.type = 'moveModule'
        jsonData.moduleId = this.id;
        jsonData.newPosition = newPosition;

        connection.send(JSON.stringify(jsonData));
    }
	
	enable_moving(){
		this.moving = true;
	}
	
	disable_moving(){
		this.moving = false;
	}
	
	draw(ctx){
		ctx.fillStyle = styles[this.type]
		ctx.fillRect(this.position.x,this.position.y, MODULESIZE,MODULESIZE);
	}
    
    isNear(module){
        return abs(module.position.x-this.position.x)<MODULESIZE/2 && abs(module.position.y-this.position.y)<MODULESIZE/2; 
    }

    /**
     * 
     * @param {Module} module 
     * @param {String} position before / after
     */
    relate(module, position) {

        if (position === 'before') {
            this.before = module;
        } else {
            this.after = module;
        }

        var jsonData = {};
        jsonData.type = 'relateModules';
        jsonData.moduleId = this.id;
        jsonData.position = this.position;
        jsonData.code = this.code;
        jsonData.target = this.target;
        jsonData.before = this.before;
        jsonData.after = this.after;
        
        connection.send(JSON.stringify(jsonData));
    }

    run () {

        eval(codes[type]);
    
    }
}

class ArgModule extends Module{
	/**
     * 
     * @param {Object} position {x, y}
     * @param {String} type 
     * @param {Module} target ???? 
     * @param {Int} id Unique ??????? no se como hacer esto
     * @param {String} argument to pass	
     */
	constructor (position, type, target, id, arg, next, prev) {
		super(position, type, target, id, next, prev)
        this.arg = arg;
        
    }
	
	set_arg(arg){
		this.arg=arg;
	}
	
	run() {
        eval(codes[this.type].replace('$arg$', this.arg)); 
    }
}

class ModuleManager{

	constructor(codedata) {

		this.modules = [];
		this.count = 0;
    }
	
	add_module(newModule) {

		this.modules.push(newModule)
    }
    
    delete_module () {

        deletingModuleIds = [];

        this.modules.forEach(module => {

			if (module.moving) {

                deletingModuleIds.push(module.id);
                this.modules.remove(module);
                 
			}
        });

    }
	
	click_modules(posx, posy) {

		this.modules.forEach(module => {

			let pos = module.position;
			console.log(pos.x + " " + posx + " " + pos.y + " " + posy);
			if (pos.x > posx - 10 && pos.x < posx + 10 && pos.y > posy - 10 && pos.y < posy + 10){
                
				module.enable_moving();
            }

        });

	}
	
	release_modules() {

        activeModuleIds = [];

		this.modules.forEach(module => {

            if (module.moving) {
                this.modules.forEach(nearModule => {
                    if (module.isNear(nearModule)){
                        this.position.x = nearModule.position.x;
                        this.position.y = nearModule.position.y+MODULESIZE/2;
                    }
                });
                activeModuleIds.push(module.id);
            }
            
            module.disable_moving();
            
        });
        
	}
	
	move_modules(posx, posy) {

		this.modules.forEach(module => {

			if (module.moving) {

				module.position.x = posx;
                module.position.y = posy;
                
			}
        });
       
	}
	
	draw(ctx) {

		this.modules.forEach(module => {

            module.draw(ctx);
            
		});
	}
	
	run_modules() {

		this.modules.forEach(module => {

            module.run(this.codedata);

		});
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
	ArgModule,
    ModuleManager,
    activeModuleIds,
    deletingModuleIds,
}