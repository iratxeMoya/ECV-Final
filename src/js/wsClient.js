import { connection } from './init.js';
import { module_manager } from './client.js'
import { createModule, createElement, requestProjInfo, deleteUser } from './utils.js';
import { codeEditorPage, loginPage, regPage, projSelectPage, projListContainer, projInfoContainer, projUserContainer } from './DOMAccess.js';

connection.onopen = event => {
	console.log('connection is open');
}

connection.onclose = (event) => {
    console.log("WebSocket is closed");
};

connection.onerror = (event) => {
    console.error("WebSocket error observed:", event);
};

connection.onmessage = (event) => {
    var jsonData = JSON.parse(event.data);

    console.log(jsonData);

    if (jsonData.type === 'moveModule') {

        module_manager.move_modules(jsonData.newPosition.x, jsonData.newPosition.y);
    }
    else if (jsonData.type === 'reciveInfo') {

        if (jsonData.objectType === 'module') {

            createModule(jsonData.id, jsonData.codeType, {x: jsonData.posx, y: jsonData.posy}, null, jsonData.target, jsonData.arg, jsonData.moduleType, false, jsonData.north, jsonData.west, jsonData.east, jsonData.south)

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
            
            connection.send(JSON.stringify({type: 'getProjList'}))
        
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
        connection.send(JSON.stringify({type: 'requestInfo'}));
    }
    else if (jsonData.type === 'inviteToProj') {
        var element = document.createElement("span");

        element.innerText = jsonData.projName;
        element.classList.add("list");
        element.addEventListener("click", requestProjInfo);

        projListContainer.appendChild(element);
    }
    else if (jsonData.type === 'requestCompetition') {
        if(confirm('New Competition! Take part?')) {
            connection.send(JSON.stringify({type: 'acceptCompetition'}));
        }
        //esto creo que no hace falta
        /*else {
            connection.send(JSON.stringify({type: 'denyCompetition'}));
        }*/
    }
}