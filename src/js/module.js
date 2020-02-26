import { connection } from '.init.js';

class Module {

    /**
     * 
     * @param {Object} position {x, y}
     * @param {String} code 
     * @param {Module} target ???? 
     * @param {Int} id Unique ??????? no se como hacer esto
     */
    constructor (position, code, target, id) {
        this.previous = previous;
        this.next = next;
        this.position = position;
        this.code = code;
        this.target = target;
        this.id = id;
    }

    move (newPosition) {
        this.position = newPosition;
        // aqui hacer lo que haya que hacer para moverlo en el canvas ????

        var jsonData = {};
        jsonData.moduleId = id;
        jsonData.newPosition = newPosition;

        connection.send(JSON.stringify(jsonData));
    }
}