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
    //dbModules = db.table("pyros_modules");
}); 

wss.on('connection', function(ws) {

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

            console.log('create module: ', jsonData);

        }
        else if (jsonData.type === 'moveModule') {

            console.log('move module: ', jsonData);

        }
        else if (jsonData.type === 'deleteModule') {

            console.log('delete module: ', jsonData);

        }
        else if (jsonData.type === 'relateModules') {

            console.log('relate modules: ', jsonData);

        }
        else if (jsonData.type === 'executeGraph') {

            console.log('execute graph: ', jsonData);

        }

    });

    ws.on('close', function (event) {

        console.log('Connection closed');

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

