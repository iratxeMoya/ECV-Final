import { connection } from '.init.js';

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

export {
    Module,
	ArgModule
}