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
    ID:{
        id: X,
        objectType: X,
        prev: X,
        next: X,
        posx: X,
        target: X,
        codeType: X,
        moduleType: X,
        arg: X,
        parameters: X,
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

        }
        else if (jsonData.type === 'register') {

            console.log('register: ', jsonData);

        }
        else if (jsonData.type === 'logout') {

            console.log('logout: ', jsonData);

        }
        else if (jsonData.type === 'createModule') {

            var info = {};
            info.id = jsonData.id;
            info.objectType = 'module'; 
            info.prev = jsonData.prev ? jsonData.prev.id : null;
            info.next = jsonData.next ? jsonData.next.id : null;
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

                modules[module.id.toString()].prev = module.prev;
                modules[module.id.toString()].next = module.next;
                module.prev !== null ? modules[module.prev.toString()].next = module.id :  null;
                module.next !== null ? modules[module.next.toString()].prev = module.id :  null;

            })

            broadcastMsg(data, connectedUsers, ws);
            
        }
        else if (jsonData.type === 'createElement') {

            var info = {};

            info.id = jsonData.id;
            info.objectType = 'element'; 
            info.prev = null;
            info.next = null;
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

    fs.writeFileSync('src/data/modules.json', JSON.serialize(modules) );
    
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
        data.next = module.next;
        data.prev = module.prev;
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