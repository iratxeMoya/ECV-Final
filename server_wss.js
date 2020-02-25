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
var wsu= []

//MySQL connection
var connection = mysql.createConnection({
    host : "localhost",
    user : "ecv-user",
    password : "ecv-upf-2019",
    database : "ecv-2019"
});

var db = wrapper.wrap(connection);
var dbSeminars, dbUsers, dbMessages, dbRequests;
db.ready(function() {
    dbSeminars = db.table("pyros_seminars");
    dbRequests = db.table("pyros_requests");
    dbUsers = db.table("pyros_users");
})


wss.on('connection', function(ws) {

	ws.on('message', function(data){

        var jsonData = JSON.parse(data);

        //LOG IN y SIGN IN
        if (jsonData.type === 'login') { // {username, password}

            console.log('login: ', jsonData);

            dbUsers.findSingle({username: `= ${jsonData.username}`}, function (found) {
                
                if (passwordHash.verify(jsonData.password, found.hashedPassword)) {

                    wsu.push({
                        username: jsonData.username,
                        ws: ws,
                    })
                }

            })
            
        } 
        else if (jsonData.type === 'register') { // {username, password}

            console.log('register: ', jsonData);

            var isAvailable = true;
            dbUsers.findSingle({username: `= ${jsonData.username}`}, function (found) {
                isAvailable = false;
            })

            if (isAvailable) {

                var clean_data = {};
                clean_data.username = jsonData.username;
                clean_data.hashedPassword = passwordHash.generate(jsonData.password); // aunque en el result salga como que si, no se guarda bien

                dbUsers.save(clean_data).then(function(result) {
                    console.log('user added: ', result)
                })
            }
            
        }
        else if (jsonData.type === 'logout') {

            console.log("logout: ", jsonData);
            var user = wsu.filter(u => u.username === jsonData.username);
            wsu.delete(user);
        }

        //CHAT
        else if (jsonData.type === 'sendMsg') { // {sender, subject, text}

            console.log('message sended: ', jsonData);
            //! FALTA
        }

        //ENCUENTROS
        else if (jsonData.type === 'createSeminar') { // {prof, subject, description}

            console.log('createSeminar: ', jsonData);

            let clean_data = {};
            clean_data.prof = jsonData.creator;
            clean_data.subject = jsonData.subject;
            clean_data.description = jsonData.description;

            dbSeminars.save(clean_data).then(function(result){
                console.log("seminar added");
            });

            broadcastMsg(jsonData, wsu);

        }
        else if(jsonData.type === 'createRequest') {

            console.log('createRequest: ', jsonData);
            let clean_data = {};
            clean_data.student = jsonData.requester;
            clean_data.subject = jsonData.subject;
            clean_data.description = jsonData.description;

            dbRequests.save(clean_data).then(function(result) {
                console.log('request added');
            });
            
            broadcastMsg(jsonData, wsu);
        }
        else if (jsonData.type === 'applySeminar') {

            console.log('applySeminar: ', jsonData);
            //! FALTA
        }
        
	});
	ws.on('close', function (event) {
		
	})
});

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
