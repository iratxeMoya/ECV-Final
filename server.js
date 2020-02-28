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

//MySQL connection
/*ar connection = mysql.createConnection({
    host : "localhost",
    user : "ecv-user",
    password : "ecv-upf-2019",
    database : "ecv-2019"
});

var db = wrapper.wrap(connection);
var dbUsers, dbModules;

db.ready(function() {jsonData
    dbUsers = db.tabljsonData
    dbModules = db.tajsonData
});*/ 

wss.on('connection', function(ws) {

    connectedUsers.push({
        ws: ws,
    });

    ws.on('message', function (data) {

        jsonData = JSON.parse(data);

        console.log('new message: ', jsonData)
        
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

            console.log(process.cwd())

            var info = {};
            info.id = jsonData.moduleId;
            info.prev_id = jsonData.before ? jsonData.before.id : null;
            info.next_id = jsonData.after ? jsonData.after.id : null;
            info.posx = jsonData.position.x;
            info.posy = jsonData.position.y;
            info.target_id = jsonData.target ? jsonData.target.id : null;

            fs.readFile('src/data/modules.json', 'utf8', (err, jsonString) => {
                if (err) {
                    console.log("File read failed:", err)
                    return
                }

                var jsonData = JSON.parse(jsonString);
                console.log(info);

                fs.writeFile("src/data/modules.json", jsonData, 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                
                    console.log("The file was saved!");
                });
            })

            

            broadcastMsg(data, connectedUsers, ws);
            
        }
        else if (jsonData.type === 'moveModule') {
            
            broadcastMsg(data, connectedUsers, ws);

        }
        else if (jsonData.type === 'clickModule') {

            broadcastMsg(data, connectedUsers, ws);
            
        }
        else if (jsonData.type === 'releaseModule') {

            //change position of the modules moving???????

            console.log(jsonData.modules);

            broadcastMsg(data, connectedUsers, ws);
            
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

function broadcastMsg(data, usersToSend, ws) {

	usersToSend.forEach(user => {

        if(user.ws !== ws) {

            user.ws.send(data);

        }
			
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
