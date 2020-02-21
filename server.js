var express = require('express');
var app = express();
var server = require('http').createServer(app);
var WebSocket = require('ws');
var router = express.Router();
var path = require('path');
var passwordHash = require('password-hash');

//start server
var wss = new WebSocket.Server({server});

//CLASSES
function User (username, password, role, description, habilities, classes, checklist, events, ownPosts, connection) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.description = description;
    this.habilities = habilities;
    this.classes = classes;
    this.checklist = checklist;
    this.events = events;
    this.ownPosts = ownPosts;
    this.connection = connection;
}

function Hability (name, level) {
    this.name = name;
    this.level = level;
}

function Class (name, teacher, students) {
    this.name = name;
    this.teacher = teacher;
    this.students = students;
    this.members = students.concat([teacher])
}

function ChecklistElement (name, checked) {
    this.name = name;
    this.checked = checked;
}

function Event (startDate, startTime, endDate, endTime, name, color, subject, isPrivate) {
    this.startDate = startDate;
    this.startTime = startTime;
    this.endDate = endDate;
    this.endTime = endTime;
    this.name = name;
    this.color = color;
    this.subject = subject;
    this.isPrivate = isPrivate;
}

function Post (sender, subject, level, classDays, classTimeStart, classTimeEnd, description) {
    this.sender = sender;
    this.subject = subject;
    this.level = level;
    this.classDays = classDays;
    this.classTimeStart = classTimeStart;
    this.classTimeEnd = classTimeEnd;
    this.description = description;
}

function Message (sender, text, subject) {
	this.sender = sender;
    this.text = text;
    this.subject = subject;
}

//LISTS
var posts = []; // lista de Post
var users = []; // lista de User
var connectedUsers = []; // lista de User
var messages = []; // lista de Message
var subjects = []; // lista de Class

wss.on('connection', function(ws) {

	ws.on('message', function(data){

        var jsonData = JSON.parse(data);

        //LOG IN y SIGN IN
        if (jsonData.type === 'login') { // {username, password}

            var foundUser = users.find(user => user.username === jsonData.username);

            if (foundUser && passwordHash.verify(jsonData.password, foundUser.password)) {
                connectedUsers.push(foundUser);

                //! Avisar a todos los miembros de las clases del user que hay una nueva conexion! FALTA
                //! send all posts
                //! send all messages
            }
        } 
        else if (jsonData.type === 'register') { // {username, password}

            var foundUser = users.find(user => user.username === jsonData.username);
            
            if (!foundUser) {

                var newUser = new User (jsonData.username, passwordHash.generate(jsonData.password), jsonData.role, [], [], [], [], [], ws);
                users.push(newUser);
                connectedUsers.push(newUser);

                //! send all posts
                //! send all messages

            }
        }

        //CHAT
        else if (jsonData.type === 'chatMsg') { // {sender, subject, text}

            var message = new Message (jsonData.sender, jsonData.text, jsonData.subject);
            messages.push(message);

            var subject = subjects.find(subject => subject.name === jsonData.subject);

            //! Mandar el mensaje a todos los del grupo (subject.members) FALTA! 
        }

        //CHECKLIST
        else if (jsonData.type === 'newChecklistElement') { // {sender, name(el name del element)}
            
            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            var newElement = new ChecklistElement(jsonData.name, false);
            users[userIndex].checklist.push(newElement);

        }
        else if (jsonData.type === 'changeChecklistElementStatus') { // {sender, checkListElement (el name), newStatus}

            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            var checklistIndex = users[userIndex].checklist.findIndex(elem => elem.name === jsonData.checklistElement);
            users[userIndex].checklist[checklistIndex].checked = jsonData.newStatus;

        }

        //PROFILE
        else if (jsonData.type === 'addHability') { // {sender, level, name (el name del hability)}

            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            var newHability = new Hability(jsonData.name, jsonData.level);
            users[userIndex].habilities.push(newHability);

            userIndex = connectedUsers(user => user.username === jsonData.sender);
            connectedUsers[userIndex].habilities.push(newHability);

            //! Avisar a todos los miembros de las clases del user que hay un cambio de nombre! FALTA

        }
        else if (jsonData.type === 'editHabilityName') { // {sender, oldName(del hability), newName(del hability)}

            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            var habilityIndex = users[userIndex].habilities.findIndex(hab => hab.name === jsonData.oldName);
            users[userIndex].habilities[habilityIndex].name = jsonData.newName;

            userIndex = connectedUsers(user => user.username === jsonData.sender);
            habilityIndex = connectedUsers[userIndex].habilities.findIndex(hab => hab.name === jsonData.oldName);
            connectedUsers[userIndex].habilities[habilityIndex].name = jsonData.newName;

            //! Avisar a todos los miembros de las clases del user que hay un cambio de nombre! FALTA
        }
        else if (jsonData.type === 'editHabilityLevel') { // {sender, name(del hability), newLevel}

            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            var habilityIndex = users[userIndex].habilities.findIndex(hab => hab.name === jsonData.name);
            users[userIndex].habilities[habilityIndex].level = jsonData.newLevel;

            userIndex = connectedUsers(user => user.username === jsonData.sender);
            habilityIndex = connectedUsers[userIndex].habilities.findIndex(hab => hab.name === jsonData.name);
            users[userIndex].habilities[habilityIndex].level = jsonData.newLevel;

            //! Avisar a todos los miembros de las clases del user que hay un cambio de nombre! FALTA
        }
        else if (jsonData.type === 'editUsername') { // {sender, newUsername}

            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            users[userIndex].username = jsonData.newUsername;

            userIndex = connectedUsers(user => user.username === jsonData.sender);
            connectedUsers[userIndex].username = jsonData.newUsername;

            //! Avisar a todos los miembros de las clases del user que hay un cambio de nombre! FALTA

        }
        else if (jsonData.type === 'editDescription') { // {sender, newDescription}

            var userIndex = users.findIndex(user => user.username === jsonData.sender);
            users[userIndex].description = jsonData.newDescription;

            userIndex = connectedUsers(user => user.username === jsonData.sender);
            connectedUsers[userIndex].description = jsonData.newDescription;

            //! Avisar a todos los miembros de las clases del user que hay un cambio de nombre! FALTA

        }

        //CALENDARIO 
        else if (jsonData.type === 'newEvent') { // {startDate, startTime, endDate, endTime, name(del event), subject, isrivate(bool)}

            var newEvent = new Event(jsonData.startDate, jsonData.startTime, jsonData.endDate, jsonData.endTime, jsonData.name, jsonData.color, jsonData.subject, jsonData.isPrivate);
            var sender = users.find(user => user.username === jsonData.sender);
            if (sender.role === 'teacher' && !jsonDate.isPrivate){
                var foundSubject = subjects.find(subj => subj.name === jsonData.subject);

                //! Enviar nuevo evento a todos los foundSubject.members!!
            }

            //* Un estudiante puede crear eventos pero solo individuales. Los teachers pueden crear eventos para toda la clase o privados
            
        }

        else if (jsonData.type === 'deleteEvent') { // {sender, event(name), subject}

            var sender = users.find(user => user.username === jsonData.sender);
            var senderIndex = users.findIndex(user => user.username === jsonData.sender);
            var eventToDelete = users[senderIndex].events.find(event => event.name === jsonData.event);

            if (eventToDelete.isPrivate) {
                users[senderIndex].events.delete(eventToDelete);
            }
            else {
                if (sender.role === 'teacher') {
                    var foundSubject = subjects.find(subj => subj.name === jsonData.subject);

                    //! Enviar a todos los foundSubject.members que un evento ha sido borrado!!
                } else {
                    //! Enviar error code al sender. NO SE PUEDE ELIMINAR UN EVENTO DE GRUPO SIENDO ESTUDIANTE!
                }
            }
        }

        //ENCUENTROS
        //* Aqui hay un lio interesante de que pasa cuando un estudiante se afilia a una clase y esas cosas
        else if (jsonData.type === 'createPost') { // {sender, subject, level, classDays, classTimeStart, classTimeEnd, description}

            var newPost = new Post(jsonData.sender, jsonData.subject, jsonData.level, jsonData.classDays, jsonData.classTimeStart, jsonData.classTimeEnd, jsonData.description);
            posts.push(newPost);

            //! send new Post to all connected users
        }
        else if (jsonData.type === 'deletePost') { // {post(name)}

            var post = posts.find(post => post.name === jsonData.post);
            posts.delete(post);

            //! Enviar a todos los connectedUsers que se ha eliminado un post
        }
        else if (jsonData.type === 'accessToPost') { // {post(name), requester, subject}

            var post = posts.find(post => post.name === jsonData.post);
            var requesterIndex = users.findIndex(user => user.username ===  jsonData.requester);
            var foundClass = subjects.find(subj => (subj.name === jsonData.subject && subj.teacher === post.sender));

            if (!foundClass) {

                var newClass = new Class(jsonData.subject, post.sender, [].push(jsonData.requester));
                subjects.push(newClass);
                users[requesterIndex].classes.push(newClass);

            } else {

                users[requesterIndex].classes.push(foundClass);
                //! avisar a los integrates actuales de la clase que hay un nuevo miembro

            }
        }
        
	});
	ws.on('close', function (event) {
		
	})
});

function broadcastMsg(data, usersToSend) {

	usersToSend.forEach(user => {

		user.connection.send(data);
			
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
