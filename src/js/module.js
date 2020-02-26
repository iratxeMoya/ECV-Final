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
		this.moving=false;
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
		this.moving=true;
	}
	
	disable_moving(){
		this.moving=false;
	}
	
	draw(ctx){
		ctx.fillStyle = "#000000"
		ctx.fillRect(100, 100, this.position.x-50, this.position.y-50);
	}
	
    /**
     * Deletes the Module
     */
    delete () {
        //! NO SE COMO HACER ESTO
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

    executeCode (codedata) {
        eval(codedata[type]);

        //! esto entiendo que no hay que pasarselo al server ya que cada cliente ejecuta el codigo
        //! cuando le da la gana no?
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
	constructor (position, type, target, id,arg) {
		super(position, type, target, id)
		this.arg = arg;
    }
	
	set_arg(arg){
		this.arg=arg;
	}
	
	executeCode(codedata,arg) {
        eval(codedata[type].replace('$arg$',arg)); 

        //! esto entiendo que no hay que pasarselo al server ya que cada cliente ejecuta el codigo
        //! cuando le da la gana no?
    }
}

class ModuleManager{
	constructor(){
		this.modules = [];
		this.count=0;
	}
	
	add_module(module){
		this.modules.push(module)
	}
	
	click_modules(posx,posy){
		this.modules.forEach(module =>{
			let pos = module.position;
			if (pos.x>posx-10 && pos.x<posx+10 && pos.y>posy-10 && pos.y<posy+10){
				module.enable_moving();
			}
		});
	}
	
	release_modules(){
		this.modules.forEach(module =>{
			let pos = module.position;
			module.disable_moving();
		});
	}
	
	move_modules(posx,posy){
		this.modules.forEach(module =>{
			if (module.moving){
				module.position.x=posx;
				module.position.y=posy;
			}
		});
	}
	
	draw(ctx){
		this.modules.forEach(module =>{
			module.draw(ctx);
		});
	}
}

export {
    Module,
	ArgModule,
	ModuleManager
}