import { connection } from './init.js';
import { module_manager,element_manager } from './client.js'
import { createModule, createElement, requestProjInfo, deleteUser } from './utils.js';
import { codeEditorPage,answerrun_popup, loginPage, regPage, projSelectPage, projListContainer, superrun_popup, noUsers_text, superrun_confirm, projUserContainer, noUsers } from './DOMAccess.js';
import { Element } from './module.js';

var user = "";

connection.onopen = event => {
	console.log('connection is open');
}

connection.onclose = (event) => {
    connection.send(JSON.stringify({type:"close",sender:user}));
};

connection.onerror = (event) => {
    console.error("WebSocket error observed:", event);
};

connection.onmessage = (event) => {
    var jsonData = JSON.parse(event.data);

    console.log('wsClient: ', jsonData);

    if (jsonData.type === 'moveModule') {

        module_manager.move_modules(jsonData.newPosition.x, jsonData.newPosition.y);
    }
    else if (jsonData.type === 'reciveInfo') {

        if (jsonData.objectType === 'module') {

            var target = element_manager.getElementById(jsonData.target);
            console.log('target: ', target, element_manager.elements, jsonData.target)

            createModule(jsonData.id, jsonData.codeType, {x: jsonData.posx, y: jsonData.posy}, null, target ? target[0] : null, jsonData.arg, jsonData.moduleType, false, jsonData.north, jsonData.west, jsonData.east, jsonData.south);

        }
        else if (jsonData.objectType === 'element') {

            createElement(jsonData.id, {x: jsonData.posx, y: jsonData.posy}, false)

        }
    }
    else if (jsonData.type === 'clickModule') {

        module_manager.click_modules(jsonData.newPosition.x, jsonData.newPosition.y);
    }
    else if (jsonData.type === 'releaseModule') {

        if (jsonData.remove) {
			module_manager.remove_modules(module_manager.getModuleByID(jsonData.modules[0].id))
        }

        module_manager.release_modules();

    }
    else if (jsonData.type === 'createModule') {

        createModule(jsonData.id, jsonData.codeType, {x: jsonData.posx, y: jsonData.posy}, null, jsonData.target, jsonData.arg, jsonData.moduleType, false, jsonData.north, jsonData.west, jsonData.east, jsonData.south);
		
    }
    else if (jsonData.type === 'createElement') {

        createElement(jsonData.id, {x: jsonData.posx, y: jsonData.posy}, false);

    }
    else if (jsonData.type === 'connectionResponse') {

        if(jsonData.status === 'OK') {

            projSelectPage.classList.toggle("showGrid");
			
            jsonData.connectionType === 'login'
                ? loginPage.classList.toggle("showBlock")
                : regPage.classList.toggle("showBlock");
            
			user = jsonData.user;
            connection.send(JSON.stringify({type: 'getProjList',sender: user}))
        
        }
        else {

            jsonData.connectionType === 'login'
                ? alert('incorrect user or password')
                : alert('Username already exists');
        }
    }
    else if (jsonData.type === 'getProjList') {

        jsonData.projects.forEach(proj => {
            var element = document.createElement("span");
            element.innerText = proj;
            element.classList.add("list");
            element.addEventListener("click", requestProjInfo);

            projListContainer.appendChild(element);
        })
    }
    else if (jsonData.type === 'projInfo') {

        var child = projUserContainer.lastElementChild;  
        while (child) { 
            projUserContainer.removeChild(child); 
            child = projUserContainer.lastElementChild; 
        } 

        jsonData.project.forEach(user => {
            var element = document.createElement("span");
            element.innerText = user;
            element.classList.add("list");
            element.addEventListener('click', deleteUser); //funcion no creada aun

            projUserContainer.appendChild(element);
        })
    }
    else if (jsonData.type === 'enterOK') {
        connection.send(JSON.stringify({type: 'requestInfo',sender:user}));
    }
    else if (jsonData.type === 'invitedToProj') {
        if(jsonData.status === 'OK') {
            var element = document.createElement("span");

            element.innerText = jsonData.projName;
            element.classList.add("list");
            element.addEventListener("click", requestProjInfo);

            projListContainer.appendChild(element);
        }
    }
    else if (jsonData.type == 'inviteToProj') {

        if(jsonData.status === 'OK') {

            var element = document.createElement("span");
            element.innerText = jsonData.username;
            element.classList.add('list');
            element.addEventListener('click', deleteUser);
        
            projUserContainer.appendChild(element);
        
        }
        else {
            alert('User not registered');
        }
    }else if(jsonData.type === 'projectResponse'){
		if (jsonData.status === 'OK') {

            var element = document.createElement("span");
            element.innerText = projName.value;
            element.classList.add("list");
            element.addEventListener("click", requestProjInfo);
        
            projListContainer.appendChild(element);
        
            projName.value = '';
        }
        else {
            alert("project name already existing");
        }
	}
    else if (jsonData.type === 'requestCompetition') {
		answerrun_popup.classList.toggle("showBlock");
    }
	else if (jsonData.type === 'everyoneReady'){
        console.log(jsonData);
        
        module_manager.everyone_ready=true;
        var child = superrun_confirm.lastElementChild;  
        while (child) { 
            superrun_confirm.removeChild(child); 
            child = superrun_confirm.lastElementChild; 
        }
        
        superrun_confirm.innerText = 'GO';
        superrun_confirm.disabled = false;
		//console.log("READY");
    }
    else if(jsonData.type === 'noUsers') {
        superrun_popup.classList.toggle("showBlock");

        superrun_confirm.innerText = '';
        let spinner = document.createElement("div");
        spinner.classList.add("spinner-grow");
        spinner.classList.add("text-muted");
        superrun_confirm.appendChild(spinner);
        superrun_confirm.disabled = true;

        noUsers_text.innerText = jsonData.msg;
        noUsers.classList.toggle("showBlock");
    }
	else if (jsonData.type === 'superRun'){
		let newData={};
		let ret=false;
		if (jsonData.config){
			console.log(jsonData.elements);
			jsonData.elements.forEach(e => {
				if(e.element.id != element_manager.contestant){
					let newElement = new Element(e.element.id, e.element.position,true);
					element_manager.add_element(newElement);
				}else{
					element_manager.move_element(e.element.id, e.element.position);
				}
			});
			//console.log(element_manager.elemets);
		}else{
			jsonData.elements.forEach(e => {
				element_manager.move_element(e.element.id, e.element.position);
			});
		}
		module_manager.server_run(element_manager.contestant);
	}else if(jsonData.type === 'endGame'){
		alert("WINNER IS "+jsonData.winner+"'S ELEMENT");
        element_manager.end_contest();
        
        superrun_confirm.innerText = '';
        let spinner = document.createElement("div");
        spinner.classList.add("spinner-grow");
        spinner.classList.add("text-muted");
        superrun_confirm.appendChild(spinner);
        superrun_confirm.disabled = true;
	}
}

export{
	user
}