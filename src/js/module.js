import { connection } from './init.js';

class Module {

    /**
     * 
     * @param {Object} position {x, y}
     * @param {String} code 
     * @param {Module} target ???? 
     * @param {Int} id Unique ??????? no se como hacer esto
     */
    constructor (position, type, target, id) {
        this.position = position;
		this.type = type;
        this.target = target;
        this.id = id;
        this.before = null;
        this.after = null;
        this.moving = false;

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
		ctx.fillStyle = "#000000"
		ctx.fillRect(this.position.x,this.position.y, 10, 10);
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

    run (codedata) {

        eval(codedata[type]);
    
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
	constructor (position, type, target, id, arg) {
		super(position, type, target, id)
        this.arg = arg;
        
    }
	
	set_arg(arg){
		this.arg=arg;
	}
	
	run(codedata) {
        eval(codedata[this.type].replace('$arg$', this.arg)); 
    }
}

class ModuleManager{

	constructor(codedata) {

		this.modules = [];
		this.count = 0;
		this.codedata = codedata;
	}
	
	add_module(newModule) {

		this.modules.push(newModule)
    }
    
    delete_module () {

        console.log(this.modules)

        this.modules.forEach(module => {

			if (module.moving) {

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

		this.modules.forEach(module => {
            
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
	ModuleManager
}