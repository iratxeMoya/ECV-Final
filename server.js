var express = require('express');
var app = express();
var server = require('http').createServer(app);
var WebSocket = require('ws');
var router = express.Router();
var path = require('path');
var passwordHash = require('password-hash');
var mysql = require ('mysql');
var wrapper = require('node-mysql-wrapper');
var fs = require('fs');

//start server
var wss = new WebSocket.Server({server});

//users ws
var connectedUsers = [];
var registeredUsers = [];

var projects = [];

/*
UN PROYECTO (como una room):

    {
        name: X, unique!
        users: [{
            id: X,
            role: X (admin, writer, viewer) ? esto mas adelante, por ahora todos write
        }]
    }

*/

//modules

var modules = {};
//contiene un elemento con key "lastSaveDate" que contiene la ultima vez que se hizo el save.

/*
DATA EXAMPLE IN MODULES:
    id:{
        id: X,
        objectType: X, (module / element)
        north: {nodeID: X, type: X},
        south: {nodeID: X, type: X},
        east: {nodeID: X, type: X},
        west: {nodeID: X, type: X},
        posx: X,
        posy: X,
        target: X, (es la id)
        codeType: X,
        moduleType: X,
        arg: X,
    }
*/

wss.on('connection', function(ws) {

    loadInformation();

    ws.on('message', function (data) {

        jsonData = JSON.parse(data);
        console.log(jsonData)
        
        if (jsonData.type === 'login') {
            
            var foundUser = registeredUsers.find(user => user.username === jsonData.username);

            if (foundUser && passwordHash.verify(jsonData.password, foundUser.hashedPassword)) {
                var sendData = {};
                sendData.type = 'connectionResponse';
                sendData.status = 'OK';
                sendData.connectionType = 'login';

                foundUser.ws = ws;
                foundUser.actualProject = null;

                connectedUsers.push(foundUser);

                ws.send(JSON.stringify(sendData));

                //init(ws);
            }
            else {
                var sendData = {};
                sendData.type = 'connectionResponse';
                sendData.status = 'notOK';
                sendData.connectionType = 'login';

                ws.send(JSON.stringify(sendData));
            }

        }
        else if (jsonData.type === 'register') {

            var foundClient = registeredUsers.find(user => user.username === jsonData.username);
			if (!foundClient) {

                var sendData = {};
                sendData.type = 'connectionResponse';
                sendData.status = 'OK';
                sendData.connectionType = 'register';

                var newUser = {};
                newUser.username = jsonData.username;
                newUser.hashedPassword = passwordHash.generate(jsonData.password);
                newUser.ws = ws;
                newUser.actualProject = null;
                newUser.projects = [];

                connectedUsers.push(newUser);
                registeredUsers.push(newUser);

                modules['lastSaveDate'] = Date.now();

                ws.send(JSON.stringify(sendData));

                //init(ws);

            } 
            else {
                var sendData = {};
                sendData.type = 'connectionResponse';
                sendData.status = 'notOK';
                sendData.connectionType = 'register';

                ws.send(JSON.stringify(sendData));

            }
            
        }
        else if (jsonData.type === 'logout') {

            console.log('logout: ', jsonData);

        }
        else if (jsonData.type === 'requestInfo') {
            init(ws);
        }
        else if (jsonData.type === 'createProject') {

            var newProj = {};
            newProj.name = jsonData.name;
            
            var creator = connectedUsers.find(user => user.ws === ws);
            var projUser = {};
            projUser.username = creator.username;
            projUser.role = 'admin';
            newProj.users = [].push(projUser);

            creator.projects.push(newProj.name);

            projects.push(newProj);

            //esto creo que no hay que broadcastearlo ya que es algo que solo le importa al server
        }
        else if (jsonData.type === 'inviteToProj') { 
            // con este invite ya se añade al projecto directamente
            // en el futuro igual estaria bien que esto solo mande un mensaje al
            // user en cuestion y solo cuando el user acepte se añada
            // pero para el mvp ya esta bien asi 

            var invited = registeredUsers.find(user => user.username === jsonData.username);
            var projUser = {};
            projUser.id = invited.id;
            projUser.role = jsonData.role;

            var projIndex = projects.findIndex(proj => proj.name === jsonData.projName);
            projects[projIndex].users.push(projUser);

            invited.projects.push(projects[projIndex].name);

            //esto creo que no hay que broadcastearlo ya que es algo que solo le importa al server

        }
        else if (jsonData.type === 'deleteFromProj') {
            
            var found = registeredUsers.find(user => user.username === jsonData.username);

            var projIndex = projects.findIndex(proj => proj.name === jsonData.projName);

            var user = projects[projIndex].users.find(user => user.id === found.id);
            projects[projIndex].users.remove(user);

            //esto creo que no hay que broadcastearlo ya que es algo que solo le importa al server
        }
        else if (jsonData.type === 'enterProj') {

            var requester = connectedUsers.find(user => user.ws === ws);
            requester.actualProject = requester.projects.find(proj => proj === jsonData.project);

        }
        else if (jsonData.type === 'getProjList') {
            var requester = connectedUsers.find(user => user.ws === ws);
            var projects = requester.projects;

            var info = {};
            info.type = 'getProjList';
            info.porjects = projects;

            ws.send(JSON.stringify(info));
        }
        else if (jsonData.type === 'requestProjInfo') {
            var project = projects.find(proj => proj.name === jsonData.project);

            var info = {};
            info.type = 'projInfo';
            info.project = project.users;

            ws.send(JSON.stringify(info));
        }
        else if (jsonData.type === 'createModule') {

            var info = {};
            info.id = jsonData.id;
            info.objectType = 'module'; 
            info.north = {nodeId: jsonData.north.node ? jsonData.north.node.id : null, type: jsonData.north ? jsonData.north.type : false};
            info.south = {nodeId: jsonData.south.node ? jsonData.south.node.id : null, type: jsonData.south ? jsonData.south.type : false};
            info.east = {nodeId: jsonData.east.node ? jsonData.east.node.id : null, type: jsonData.east ? jsonData.east.type : false};
            info.west = {nodeId: jsonData.west.node ? jsonData.west.node.id : null, type: jsonData.west ? jsonData.west.type : false};
            info.posx = jsonData.posx;
            info.posy = jsonData.posy;
            info.target = jsonData.target ? jsonData.target.id : null;
            info.codeType = jsonData.codeType;
            info.moduleType = jsonData.moduleType;
            info.arg = jsonData.arg;


            modules[jsonData.id.toString()] = info;
            modules['lastSaveDate'] = Date.now();

            var users = [];
            var creator = connectedUsers.find(user => user.ws === ws);
            var project = projects.find(proj => proj.name === creator.actualProject);

            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user.username);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, ws);
            
        }
        else if (jsonData.type === 'moveModule') {
            
            var creator = connectedUsers.find(user => user.ws === ws);
            var project = projects.find(proj => proj.name === creator.actualProject);

            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user.username);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, ws);

        }
        else if (jsonData.type === 'clickModule') {

            var creator = connectedUsers.find(user => user.ws === ws);
            var project = projects.find(proj => proj.name === creator.actualProject);

            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user.username);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, ws);
            
        }
        else if (jsonData.type === 'releaseModule') {

            jsonData.modules.forEach(module => {

                modules[module.id.toString()].posx = jsonData.posx;
                modules[module.id.toString()].posy = jsonData.posy;
				console.log(jsonData);
                if (jsonData.remove) {
                    delete modules[module.id.toString()];
                }else{
					//en jsonData.modules ya viene el north, south, east y west en el formato correcto
					modules[module.id.toString()].north = module.north;
					modules[module.id.toString()].south = module.south;
					modules[module.id.toString()].east = module.east;
					modules[module.id.toString()].west = module.west;
				}
            })

            modules['lastSaveDate'] = Date.now();

            var creator = connectedUsers.find(user => user.ws === ws);
            var project = projects.find(proj => proj.name === creator.actualProject);

            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user.username);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, ws);
            
        }
        else if (jsonData.type === 'createElement') {

            var info = {};

            info.id = jsonData.id;
            info.objectType = 'element'; 
            info.north = {nodeId: null, type: false};
            info.south = {nodeId: null, type: false};
            info.east = {nodeId: null, type: false};
            info.west = {nodeId: null, type: false};
            info.posx = jsonData.posx;
            info.posy = jsonData.posy;
            info.target = null;
            info.codeType = null;
            info.moduleType = null;
            info.arg = jsonData.arg;

            modules[jsonData.id.toString()] = info;
            modules['lastSaveDate'] = Date.now();

            var creator = connectedUsers.find(user => user.ws === ws);
            var project = projects.find(proj => proj.name === creator.actualProject);

            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user.username);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, ws);
            
        }

    });

    ws.on('close', function (event) {

        console.log('Connection closed');
        var user = connectedUsers.findByField('ws', ws);

        connectedUsers.delete(user);

        saveDatabaseToDisk();

	});
})


function loadInformation () {

    console.log('loading info');

    var serverDate = modules['lastSaveDate'];
    var diskData = loadDatabaseFromDisk();
    var diskDate = diskData[0]['lastSaveDate'];

    if (typeof diskDate === 'undefined') {
        modules = modules;
        registeredUsers = registeredUsers;
        console.log('loaded diskDate is undefined: ', modules, registeredUsers);
        return;
    }
    if (typeof serverDate === 'undefined') {
        modules = diskData[0];
        registeredUsers = diskData[1];
        console.log('loaded serverDate is undefined: ', modules, registeredUsers);
        return;
    }

    modules = serverDate && serverDate > diskDate ? modules : diskData[0];
    registeredUsers = serverDate && serverDate > diskDate ? registeredUsers : diskData[1];

    console.log('loaded: ', modules, registeredUsers);


}

function saveDatabaseToDisk()
{
    modules['lastSaveDate'] = Date.now(); 

    fs.writeFileSync('src/data/modules.json', JSON.stringify(modules) );

    registeredUsers.forEach(user => {
        delete user.ws;
    });


    var registeredUsersJson = arrayToJson(registeredUsers, 'username'); 
    fs.writeFileSync('src/data/users.json', JSON.stringify(registeredUsersJson));
    
}

function loadDatabaseFromDisk()
{

	var str = fs.readFileSync('src/data/modules.json').toString();
    ret1 = JSON.parse( str );

    var str2 = fs.readFileSync('src/data/users.json').toString();
    var registeredUsersJson = JSON.parse( str2 );
    var ret2 = jsonToArray(registeredUsersJson);

    return [ret1, ret2];
    
}


function broadcastMsg(data, usersToSend, connection) {

    usersToSend.forEach(user => {
        if(user.ws !== connection) {
            user.ws.send(data);
        }
    })
}

function init (ws) {

    for (id in modules) {

        var module = modules[id];

        var data = {};
        data.type = 'reciveInfo';
        data.posx = module.posx;
        data.posy = module.posy;
        data.codeType = module.codeType;
        data.moduleType = module.moduleType;
        data.arg = module.arg;
        data.target = module.target;
        data.id = module.id;
        data.north = module.north;
        data.south = module.south;
        data.east = module.east;
        data.west = module.west;
        data.objectType = module.objectType;

        ws.send(JSON.stringify(data));

    }

}

server.listen(9027, function() {
    console.log('app listening on port 9027');
});

//all html files in src folder
app.use(express.static(__dirname + '/src'));

//utils

Array.prototype.delete = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Object.prototype.findByField = function (field, value) {


    for (var key in this) {

        if (this[key][field] === value) {

            return this[key];

        }
    }

    return null;
};

function jsonToArray (json) {

    var array = [];

    if (Object.keys(json).length === 0) {
        return [];
    }
    for (key in json) {
        array.push(json[key]);
    }
    return array;

}

function arrayToJson (array, keyField) {

    var json = {};

    array.forEach(element => {
        json[element[keyField]] = element;
    });

    return json;
}