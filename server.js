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

// Variables
var ready_users = 0;
var total_users = 0;
var run_requester = null;
var elapsed_time = 0;
var boundaries = {top:0,bottom:0,left:0,right:0}
var elements = [];
var recived_elements = [];
var connectedUsers = [];
var registeredUsers = [];
var projects = [];
var modules = {};

//start server
var wss = new WebSocket.Server({server});

loadInformation();

wss.on('connection', function(ws) {

    ws.on('message', function (data) {

        jsonData = JSON.parse(data);

        if (jsonData.type === 'login') {
            
            var foundUser = registeredUsers.find(user => user.username === jsonData.username);

            if (foundUser && passwordHash.verify(jsonData.password, foundUser.hashedPassword)) {

                var sendData = {};
                sendData.type = 'connectionResponse';
                sendData.status = 'OK';
                sendData.connectionType = 'login';
				sendData.user = jsonData.username;

                foundUser.ws = ws;
                foundUser.actualProject = "none";

                connectedUsers.push(foundUser);

                ws.send(JSON.stringify(sendData));

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
				sendData.user = jsonData.username;

                var newUser = {};
                newUser.username = jsonData.username;
                newUser.hashedPassword = passwordHash.generate(jsonData.password);
                newUser.ws = ws;
                newUser.actualProject = "none";
                newUser.projects = [];

                connectedUsers.push(newUser);
                registeredUsers.push(newUser);

                modules['lastSaveDate'] = Date.now();

                ws.send(JSON.stringify(sendData));

            } 
            else {
                var sendData = {};
                sendData.type = 'connectionResponse';
                sendData.status = 'notOK';
                sendData.connectionType = 'register';

                ws.send(JSON.stringify(sendData));

            }

        }
        else if (jsonData.type === 'requestInfo') {

            init(ws);

        }
        else if (jsonData.type === 'createProject') {

            var foundProj = projects.find(proj => proj.name === jsonData.name);
            
			if (!foundProj) {

				var requester = connectedUsers.find(user => user.username === jsonData.sender);

				var newProj = {};
				newProj.name = jsonData.name;
				
				newProj.users = [requester.username];
				newProj.execute = 0;
				newProj.admin = requester.username;
				newProj.lap=0;
				requester.projects.push(newProj.name);

				projects.push(newProj);
				
				modules[jsonData.name] = {};
				console.log('en create proj: ', modules);
                modules['lastSaveDate'] = Date.now();
                
                var sendData = {};
                sendData.type = 'projectResponse';
                sendData.status = 'OK';

                ws.send(JSON.stringify(sendData));

            }
            else {
                var sendData = {};
                sendData.type = 'projectResponse';
                sendData.status = 'notOK';

                ws.send(JSON.stringify(sendData));

            }

        }
        else if (jsonData.type === 'inviteToProj') { 

            var invited = registeredUsers.find(user => user.username === jsonData.username);

            var projIndex = projects.findIndex(proj => proj.name === jsonData.projName);

            if (projIndex !== 0 && invited) {

                projects[projIndex].users.push(invited.username);
                invited.projects.push(projects[projIndex].name);
                modules['lastSaveDate'] = Date.now();
                jsonData.status = 'OK';

                ws.send(JSON.stringify(jsonData));

                jsonData.type = 'invitedToProj';

                if(invited.ws) {

                    invited.ws.send(JSON.stringify(jsonData));

                }
                
            } 
            else {

                jsonData.status = 'notOK';
                ws.send(JSON.stringify(jsonData));

            }

        }
        else if (jsonData.type === 'deleteFromProj') {
            
            projects[projIndex].users.remove(jsonData.username);

            modules['lastSaveDate'] = Date.now();

        }
        else if (jsonData.type === 'enterProj') {

            var requester = connectedUsers.find(user => user.username === jsonData.sender);
            requester.actualProject = requester.projects.find(proj => proj === jsonData.project);

            ws.send(JSON.stringify({type: 'enterOK'}));

        }
        else if (jsonData.type === 'getProjList') {

            var requester = connectedUsers.find(user => user.username === jsonData.sender);
            var userProjects = requester.projects ? requester.projects : [];

            var info = {};
            info.type = 'getProjList';
            info.projects = userProjects;

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

            var requester = connectedUsers.find(user => user.username === jsonData.sender);

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

            modules[requester.actualProject][jsonData.id.toString()] = info;
            modules['lastSaveDate'] = Date.now();

            orderModules();

            var users = [];
            var project = projects.find(proj => proj.name === requester.actualProject);

            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, jsonData.sender);

        }
        else if (jsonData.type === 'moveModule') {
            
            var creator = connectedUsers.find(user => user.username === jsonData.sender);
            var project = projects.find(proj => proj.name === creator.actualProject);

            var users = [];
            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, jsonData.sender);

        }
        else if (jsonData.type === 'clickModule') {

			connectedUsers.forEach(u=>{console.log((u.username === jsonData.sender)+" "+u.username)});
            var creator = connectedUsers.find(us => us.username === jsonData.sender);
            var project = projects.find(proj => proj.name === creator.actualProject);

            var users = [];
            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user);
                if (u) {
                    console.log(u.username);
                    users.push(u);
                }
            })

            broadcastMsg(data, users, jsonData.sender);

        }
        else if (jsonData.type === 'releaseModule') {

            var requester = connectedUsers.find(user => user.username === jsonData.sender);

            jsonData.modules.forEach(module => {

                modules[requester.actualProject][module.id.toString()].posx = jsonData.posx;
                modules[requester.actualProject][module.id.toString()].posy = jsonData.posy;

                if (jsonData.remove) {

                    delete modules[requester.actualProject][module.id.toString()];

                }
                else{

					modules[requester.actualProject][module.id.toString()].north = module.north;
					modules[requester.actualProject][module.id.toString()].south = module.south;
					modules[requester.actualProject][module.id.toString()].east = module.east;
                    modules[requester.actualProject][module.id.toString()].west = module.west;
                    
				}
            })

            modules['lastSaveDate'] = Date.now();

            var project = projects.find(proj => proj.name === requester.actualProject);

            var users = [];
            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, jsonData.sender);

        }
        else if (jsonData.type === 'createElement') {

            var requester = connectedUsers.find(user => user.username === jsonData.sender);

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

            modules[requester.actualProject][jsonData.id.toString()] = info;
            modules['lastSaveDate'] = Date.now();

            orderModules();

            var project = projects.find(proj => proj.name === requester.actualProject);

            var users = [];
            project.users.forEach(user => {
                var u = connectedUsers.find(u => u.username === user);
                if (u) {
                    users.push(u);
                }
            })

            broadcastMsg(data, users, jsonData.sender);

        }
        else if (jsonData.type === 'requestCompetition') {

            elapsed_time = 0;

			var requester = connectedUsers.find(user => user.username === jsonData.sender);
			boundaries.bottom = jsonData.mapBottom;
            boundaries.right = jsonData.mapRight;
            total_users = 0;

            projects.forEach(project => {

                var admin = connectedUsers.find(user => user.username === project.admin);

                if (admin && admin.actualProject === project.name && admin.username !== jsonData.sender) {

                    admin.ws.send(data);
                    total_users++;
                    
                }
                if (admin && admin.username === jsonData.sender) {

                    var project = projects.find(p => p.name === admin.actualProject);
                    project.execute = 1;
					elements.push({element:{id:jsonData.elementId,position:{x:Math.floor(Math.random()*100)%(boundaries.right-8)+4,y:Math.floor(Math.random()*100)%(boundaries.bottom-4)+2}},projectName:project.name})
					recived_elements.push(false);
                    total_users++;
                    
                }
            });

			ready_users = 1;
            run_requester = requester.username;

			if (total_users < 1){

                connectedUsers.find(us => us.username === run_requester).ws.send(JSON.stringify({type:"everyoneReady"}));
                
            }
            if(total_users === 1) {

                connectedUsers.find(us => us.username === run_requester).ws.send(JSON.stringify({type: 'noUsers', msg: 'There are not connected users to commpete!'}));

            }
        }
        else if (jsonData.type === 'acceptCompetition') {

            var admin = connectedUsers.find(user => user.username === jsonData.sender);
            var project = projects.find(p => p.name === admin.actualProject);

			ready_users++;
            project.execute = 1;
			elements.push({element:{id:jsonData.elementId,position:{x:Math.floor(Math.random()*100)%(boundaries.right-8)+4,y:Math.floor(Math.random()*100)%(boundaries.bottom-4)+2}},projectName:project.name})
			recived_elements.push(false);
;
			if (ready_users>=total_users){

                connectedUsers.find(cu=>cu.username === run_requester).ws.send(JSON.stringify({type:"everyoneReady"}));
                
			}

        }
        else if(jsonData.type === 'denyCompetition'){

            var admin = connectedUsers.find(user => user.username === jsonData.sender);
            var project = projects.find(p => p.name === admin.actualProject);

            project.execute = -2; //denied
            total_users -= 1;

            if (ready_users>=total_users && total_users === 1){

                connectedUsers.find(us => us.username === run_requester).ws.send(JSON.stringify({type: 'noUsers', msg: 'The connected users do not want to compete!'}));
				
			}

        }
        else if (jsonData.type === 'cancelCompetition') {

            projects.forEach(project => {

                var admin = connectedUsers.find(user => user.username === project.admin);

                if (admin && admin.actualProject === project.name && admin.username !== jsonData.sender) {

                    var info = {};
                    info.type = 'cancelCompetition';
                    info.status = project.execute === 1 ? 'accepted' : project.execute === -2 ? 'denied' : 'unaccepted';
                    info.msg = 'Competition canceled';
                    admin.ws.send(JSON.stringify(info));

                }
                project.execute = 0;

            })

        }
		else if (jsonData.type === 'superRun') {

            var admin = connectedUsers.find(user => user.username === jsonData.sender);
            var project = projects.find(p => p.name === admin.actualProject);
            var element = elements.find(e => e.element.projName = project.name);

            console.log(jsonData.contestant, element);

            if(jsonData.contestant) {
                element.element.id = jsonData.contestant;
            }
            
			super_run(true)

        }
		else if (jsonData.type === 'superResponse') {

            let elementidx=elements.findIndex(e=>e.element.id.toString() === jsonData.element.id.toString());
            
			if(!recived_elements[elementidx]) {

				ready_users++;
                recived_elements[elementidx] = true;
                
				elements[elementidx] = {element:jsonData.element,projectName:elements[elementidx].projectName};

			}

			if(ready_users >= total_users) {

				recived_elements.fill(false);
                ready_users = 0;
                
				elements.forEach(e => {

                    if (!valid_pos(e.element)) {

                        projects.find(proj => e.projectName === proj.name).execute = -1;
                        total_users--;
                        let idx = elements.findIndex(er => e.projectName === er.projectName)
                        elements.splice(idx,1);
                        
                    }
				});
				if(total_users > 1 && elapsed_time < 10) {

                    super_run(false);
                    
                }
                else {
                    
                    if(elements.length > 1) {

                        end_game('empate');

                    }
                    else {

                        end_game(elements[0].projectName);

                    }
					
				}
			}

        }
		else if (jsonData.type === 'close') {

			var uidx = connectedUsers.findIndex(u=>u.username === jsonData.sender);
			connectedUsers.splice(uidx,1);

		}
    });

    ws.on('close', function (event) {

		var uidx = connectedUsers.findIndex(u=>u.ws === ws);
		connectedUsers.splice(uidx,1);
		
        saveDatabaseToDisk();

	});
})

function super_run(config) {

    ready_users = 0;
    elapsed_time += 1;

    console.log('iteracion num: ', elapsed_time);

		projects.forEach(project => {

			var admin = connectedUsers.find(user => user.username === project.admin);

			if (admin && admin.actualProject === project.name && project.execute>0) {

				let data = {
					type:"superRun",
					elements:elements,
					config:config
                };
                
                admin.ws.send(JSON.stringify(data));
                
			}
		})
}

function end_game(winner) {

    
	projects.forEach(project => {

		if(project.execute!=0) {

            isFirst = false;

			var admin = connectedUsers.find(user => user.username === project.admin);
			let data = {
				type:"endGame",
                winner: winner === 'empate' ? elements : winner,
                empate: winner === 'empate'
			};
            admin ? admin.ws.send(JSON.stringify(data)) : null;
            
        }
        project.execute = 0;
    });
    elements = [];
	
}

function valid_pos(element) {
	
	var ret = element.position.x>boundaries.left  && element.position.x<boundaries.right && element.position.y> boundaries.top && element.position.y<boundaries.bottom;
	let px =element.position.x;
	let py =element.position.y;

	switch(element.dir) {
		case 0:

			px -= 1;
            break;
            
		case 1:

            py -= 1;
            break;
            
		case 2:

			px += 1;
            break;
            
		default:

            py += 1;
            
	}
	
	elements.forEach(e=> {

        ret = e.element.id !== element.id ? ret && !(e.element.position.x === px && e.element.position.y === py) : ret;	
        
	});

    return ret;
    
}

function loadInformation () {

    var serverDate = modules['lastSaveDate'];
    var diskData = loadDatabaseFromDisk();
    var diskDate = diskData[0]['lastSaveDate'];

    if (typeof diskDate === 'undefined') {

        modules = modules;
        registeredUsers = registeredUsers;
        projects = projects;

        return;
    }
    if (typeof serverDate === 'undefined') {

        modules = diskData[0];
        registeredUsers = diskData[1];
        projects = diskData[2]

        return;
    }

    modules = serverDate && serverDate > diskDate ? modules : diskData[0];
    registeredUsers = serverDate && serverDate > diskDate ? registeredUsers : diskData[1];
    projects = serverDate && serverDate > diskDate ? projects : diskData[2];

}

function saveDatabaseToDisk() {

    modules['lastSaveDate'] = Date.now(); 

    fs.writeFileSync('src/data/modules.json', JSON.stringify(modules) );

	saveJson = [];
	
    registeredUsers.forEach(user => {

		let jsonSave ={}
		jsonSave.username = user.username;
		jsonSave.hashedPassword = user.hashedPassword;
		jsonSave.actualProject = user.actualProject;
		jsonSave.projects = user.projects;
        saveJson.push(jsonSave);
        
    });


    var registeredUsersJson = arrayToJson(saveJson, 'username'); 
    fs.writeFileSync('src/data/users.json', JSON.stringify(registeredUsersJson));

    var projectsJson = arrayToJson(projects, 'name'); 
    fs.writeFileSync('src/data/projects.json', JSON.stringify(projectsJson));
    
}

function loadDatabaseFromDisk()
{

	var str = fs.readFileSync('src/data/modules.json').toString();
    ret1 = JSON.parse( str );

    var str2 = fs.readFileSync('src/data/users.json').toString();
    var registeredUsersJson = JSON.parse( str2 );
    var ret2 = jsonToArray(registeredUsersJson);

    var str3 = fs.readFileSync('src/data/projects.json').toString();
    var projectsJson = JSON.parse( str3 );
    var ret3 = jsonToArray(projectsJson);

    return [ret1, ret2, ret3];
    
}


function broadcastMsg(data, usersToSend, broadcaster) {

    usersToSend.forEach(user => {
        if(user.username !== broadcaster) {
            user.ws.send(data);
        }
    })
}

function orderModules () {

    const ordered = {};
    Object.keys(modules).sort().forEach(function(key) {
    ordered[key] = modules[key];
    });

    modules = ordered; 

    for (project in modules) {

        var mod = {};
        var elem = {};

        for (id in modules[project]) {

            if (modules[project][id].objectType === 'module') {

                mod[id] = modules[project][id];

            } 
            else {

                elem[id] = modules[project][id];

            }

        }
        modules[project] = Object.assign(elem, mod);

    }
}

function init (ws) {

    var requester = connectedUsers.find(user => user.ws === ws);

    orderModules();

    for (project in modules) {

        if (requester.actualProject === project) {

            for(id in modules[project]) {

                var module = modules[project][id];

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