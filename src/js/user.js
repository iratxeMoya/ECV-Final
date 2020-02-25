import { connection } from './init.js';

class User {

    constructor(username, password, enterType) { // enterType puede ser 'login' o signin'

        this.username = username;
        this.password = password;

        console.log(this.username, this.password)

        var jsonData = {};
        jsonData.type = enterType;
        jsonData.username = username;
        jsonData.password = password;

        connection.send(JSON.stringify(jsonData));
    }

    logOut () {

        var jsonData = {};
        jsonData.type = 'logout';
        jsonData.username = this.username;
        
        connection.send(JSON.stringify(jsonData));
    }

    sendMsg (msg) {

        var jsonData = {};
        jsonData.type = 'sendMsg';
        jsonData.username = this.username;
        jsonData.msg = msg;

        connection.send(JSON.stringify(jsonData));
    }
}

class Student extends User {

    constructor (username, password, enterType, requests = [], appliedSeminars = []) {

        super(username, password, enterType);
        this.requests = requests;
        this.appliedSeminars = appliedSeminars;
    }

    createRequest (subject, description) {

        var request = {};
        request.subject = subject;
        request.description = description;

        this.requests.push(request);

        var jsonData = {};
        jsonData.type = 'createRequest';
        jsonData.requester = this.username;
        jsonData.subject = subject;
        jsonData.description = description;

        connection.send(JSON.stringify(jsonData));
    }

    applySeminar (subject, teacher, students = []) {

        var seminar = {};
        seminar.subject = subject;
        seminar.teacher = teacher;
        seminar.students = students;

        this.appliedSeminars.push(seminar);

        var jsonData = {};
        jsonData.type = 'applySeminar';
        jsonData.applier = this.username;
        jsonData.subject = subject;
        jsonData.teacher = teacher;
        jsonData.students = students;

        connection.send(JSON.stringify(jsonData));
    }
}

class Teacher extends User {

    constructor (username, password, enterType, postedSeminars = [], currentSeminars = []) {

        super(username, password, enterType);
        this.postedSeminars = postedSeminars;
        this.currentSeminars = currentSeminars;
    }

    createSeminar(subject, description) {

        var jsonData = {};
        jsonData.type = 'createSeminar';
        jsonData.creator = this.username;
        jsonData.subject = subject;
        jsonData.description = description;

        connection.send(JSON.stringify(jsonData));
    }
}

export {
    Student,
    Teacher,
}