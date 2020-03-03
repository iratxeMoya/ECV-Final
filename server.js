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
/*var connection = mysql.createConnection({
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

            console.log('create Module: ', jsonData);

            var info = {};
            info.id = jsonData.moduleId;
            info.objType = 'module'; 
            info.prev_id = jsonData.before ? jsonData.before.id : null;
            info.next_id = jsonData.after ? jsonData.after.id : null;
            info.position = jsonData.position;
            info.target_id = jsonData.target ? jsonData.target.id : null;
            info.type = jsonData.moduleType;
            info.arg = jsonData.arg;

            fs.readFile('src/data/modules.json', 'utf8', (err, jsonString) => {
                if (err) {
                    console.log("File read failed:", err)
                    return;
                }

                var json = JSON.parse(jsonString);
                json[info.id.toString()] = info;
                jsonStr = JSON.stringify(json);


                fs.writeFile("src/data/modules.json", jsonStr, 'utf8', function (err) {
                    if (err) {
                        return console.log('error: ', err);
                    }
                
                    console.log("The file was saved! ", jsonStr);
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

            console.log('in release ', jsonData);createElement
createElement
            jsonData.modules.forEach(module => {createElement
                fs.readFile('src/data/modules.json', 'utf8', (err, jsonString) => {
                    if (err) {
                        console.log("File read failed:", err)
                        return
                    }
                    
                    var json = JSON.parse(jsonString);
                    json[module.id.toString()].position = jsonData.position;

                    if (jsonData.remove) {
                        delete json[module.id.toString()];
                    }

                    json[module.id.toString()].prev_id = module.prev;
                    json[module.id.toString()].next_id = module.next;
                    module.prev !== null ? json[module.prev.toString()].next_id = module.id :  null;
                    module.next !== null ? json[module.next.toString()].prev_id = module.id :  null;
                    jsonStr = JSON.stringify(json);

                    var jsonStr = JSON.stringify(json);
    
                    fs.writeFile("src/data/modules.json", jsonStr, 'utf8', function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    
                        console.log("The file was saved! ", jsonStr);
                    });
                })
            })

            broadcastMsg(data, connectedUsers, ws);
            
        }
        else if (jsonData.type === 'createElement') {

            console.log('create Element: ', jsonData);

            var info = {};
            info.id = jsonData.id;
            info.position = jsonData.position;
            info.objType = 'element';

            fs.readFile('src/data/modules.json', 'utf8', (err, jsonString) => {
                if (err) {
                    console.log("File read failed:", err)
                    return;
                }

                var json = JSON.parse(jsonString);
                json[info.id.toString()] = info;
                jsonStr = JSON.stringify(json);


                fs.writeFile("src/data/modules.json", jsonStr, 'utf8', function (err) {
                    if (err) {
                        return console.log('error: ', err);
                    }
                
                    console.log("The file was saved! ", jsonStr);
                });
            })

            

            broadcastMsg(data, connectedUsers, ws);
            
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

function init (ws) {

    fs.readFile('src/data/modules.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }

        var json = JSON.parse(jsonString);

        console.log('in init: ', json);
        for (moduleId in json) {
            var module = json[moduleId];
            var data = {};
            data.type = 'createModule';
            data.position = module.position;
            data.moduleType = module.type;
            data.arg = module.arg;
            data.target = module.target;
            data.moduleId = module.id;
            data.next = module.next_id;
            data.prev = module.prev_id;

            ws.send(JSON.stringify(data));

        }

    })

}