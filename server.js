var express = require('express');
var app = express();
var server = require('http').createServer(app);
var WebSocket = require('ws');
var router = express.Router();
var path = require('path');
var passwordHash = require('password-hash');
var mysql = require ('mysql');
var wrapper = require('node-mysql-wrapper');

//start server
var wss = new WebSocket.Server({server});

//users ws
var connectedUsers = [];

//MySQL connection
var connection = mysql.createConnection({
    host : "localhost",
    user : "ecv-user",
    password : "ecv-upf-2019",
    database : "ecv-2019"
});

var db = wrapper.wrap(connection);
var dbUsers, dbModules;

db.ready(function() {
    dbUsers = db.table("pyros_users");
    dbModules = db.table("pyros_modules");
}); 

wss.on('connection', function(ws) {

    connectedUsers.push({
        ws: ws,
    });

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

            console.log('create Module: ', jsonData);

            //! LA ID DE LA DB NO ES AUTO INCREMENT, ES LA QUE SE LE META!

            var info = {};
            info.id = jsonData.moduleId;
            info.prev_id = jsonData.before ? jsonData.before.id : null;
            info.next_id = jsonData.after ? jsonData.after.id : null;
            info.posx = jsonData.position.x;
            info.posy = jsonData.position.y;
            info.target_id = jsonData.target ? jsonData.target.id : null;

            dbModules.save(info).then(function(result) {

                console.log('added Module: ', result);

            })

            broadcastMsg(data, connectedUsers);
            
        }
        else if (jsonData.type === 'moveModule') {

            console.log('move Module: ', jsonData);

            //! Tenemos que conseguir que el id del modulo sea el id de la db

            dbModules.findSingle({id: `= ${jsonData.id}`}, function (found) {

                found.posx = jsonData.newPosition.x;
                found.posy = jsonData.newPosition.y;

            });
            
            broadcastMsg(data, connectedUsers);

        }
        else if (jsonData.type === 'deleteModule') {

            console.log('delete module: ', jsonData);

        }
        else if (jsonData.type === 'relateModules') {

            console.log('relate modules: ', jsonData);

        }

    });

    ws.on('close', function (event) {

        console.log('Connection closed');
        var user = { ws: ws };

        connectedUsers.delete(user);

	});
})

function broadcastMsg(data, usersToSend) {

	usersToSend.forEach(user => {

		user.ws.send(data);
			
	});
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

