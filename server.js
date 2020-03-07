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

//modules

var modules = {};

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

    connectedUsers.push({
        ws: ws,
    });

    init(ws);

    ws.on('message', function (data) {

        jsonData = JSON.parse(data);
        
        if (jsonData.type === 'login') {

            console.log('login: ', jsonData);

            var sendData = {};
            sendData.type = 'connectionResponse';
            sendData.status = 'OK';
            sendData.connectionType = 'login';

            broadcastMsg(JSON.stringify(sendData), connectedUsers, ws);

        }
        else if (jsonData.type === 'register') {

            console.log('register: ', jsonData);

            var sendData = {};
            sendData.type = 'connectionResponse';
            sendData.status = 'OK';
            sendData.connectionType = 'register';

            broadcastMsg(JSON.stringify(sendData), connectedUsers, ws);

        }
        else if (jsonData.type === 'logout') {

            console.log('logout: ', jsonData);

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

            broadcastMsg(data, connectedUsers, ws);
            
        }
        else if (jsonData.type === 'moveModule') {
            
            broadcastMsg(data, connectedUsers, ws);

        }
        else if (jsonData.type === 'clickModule') {

            broadcastMsg(data, connectedUsers, ws);
            
        }
        else if (jsonData.type === 'releaseModule') {

            console.log('in release ', jsonData);
            jsonData.modules.forEach(module => {

                modules[module.id.toString()].posx = jsonData.posx;
                modules[module.id.toString()].posy = jsonData.posy;

                if (jsonData.remove) {
                    delete modules[module.id.toString()];
                }

                //en jsonData.modules ya viene el north, south, east y west en el formato correcto
                modules[module.id.toString()].north = module.north;
                modules[module.id.toString()].south = module.south;
                modules[module.id.toString()].east = module.east;
                modules[module.id.toString()].west = module.west;

            })

            broadcastMsg(data, connectedUsers, ws);
            
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

            broadcastMsg(data, connectedUsers, ws);
            
        }

    });

    ws.on('close', function (event) {

        console.log('Connection closed');
        var user = { ws: ws };

        connectedUsers.delete(user);

        saveDatabaseToDisk();

	});
})

function saveDatabaseToDisk()
{

    fs.writeFileSync('src/data/modules.json', JSON.stringify(modules) );
    
}

function loadDatabaseFromDisk()
{

	var str = fs.readFileSync('src/data/modules.json').toString();
    modules = JSON.parse( str );
    
}


function broadcastMsg(data, usersToSend, ws) {

	usersToSend.forEach(user => {

        if(user.ws !== ws) {

            user.ws.send(data);

        }
			
	});
}

function init (ws) {

    loadDatabaseFromDisk ();

    for (id in modules) {

        var module = modules[id];

        var data = {};
        data.type = 'reciveInfo';
        data.posx = module.posx;
        data.posy = module.posy;
        data.codeType = module.codeType;
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