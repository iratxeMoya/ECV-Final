import {
    loginPage,
    loginPass,
    loginSend,
    loginUser,
    regPage,
    regPass,
    regSend,
    regUser,
    goToLog,
    goToReg,
    projName,
    createProj,
    newUser,
    addUser,
    projInfoContainer,
    projUserContainer,
    projListContainer,
    enterProj,
    projSelectPage,
    codeEditorPage
} from './DOMAccess.js';
import {connection} from './init.js';
import { actualProject, requestProjInfo, deleteUser } from './utils.js';

goToLog.addEventListener("click", toggleLogReg);
goToReg.addEventListener("click", toggleLogReg);
loginSend.addEventListener("click", sendLogin);
regSend.addEventListener("click", sendRegister);
createProj.addEventListener("click", createProject);
projName.addEventListener("keydown", onKeyDownProj);
newUser.addEventListener("keydown", onKeyDownUser);
addUser.addEventListener("click", addUserToProj);
enterProj.addEventListener("click", enterProject);
loginPass.addEventListener("keydown", onKeyDownLog);
regPass.addEventListener("keydown", onKeyDownReg);

function onKeyDownUser (event) {

    if(event.keyCode === 13) {
        addUserToProj();
    }

}

function onKeyDownProj (event) {

    if (event.keyCode === 13) {
        createProject();
    }
    
}

function onKeyDownLog (event) {

    if (event.keyCode === 13) {
        sendLogin();
    }

}

function onKeyDownReg (event) {

    if (event.keyCode === 13) {
        sendRegister();
    }

}

function enterProject () {

    var jsonData = {};
    jsonData.type = 'enterProj';
    jsonData.project = actualProject;

    projSelectPage.classList.toggle("showGrid");
    codeEditorPage.classList.toggle("showBlock");

    connection.send(JSON.stringify(jsonData));

}

function addUserToProj () {

    var jsonData = {};
    jsonData.type = 'inviteToProj';
    jsonData.projName = actualProject;
    jsonData.username = newUser.value;

    connection.send(JSON.stringify(jsonData));

    var element = document.createElement("span");
    element.innerText = newUser.value;
    element.addEventListener('click', deleteUser);

    projUserContainer.appendChild(element);
}

function createProject () {
    var jsonData = {};
    jsonData.type = 'createProject';
    jsonData.name = projName.value;

    connection.send(JSON.stringify(jsonData));

    var element = document.createElement("span");
    console.log(projName.value)
    element.innerText = projName.value;
    element.classList.add("list");
    element.addEventListener("click", requestProjInfo);

    projListContainer.appendChild(element);
}

function toggleLogReg() {
    regPage.classList.toggle("showBlock");
    loginPage.classList.toggle("showBlock");
}

function sendLogin () {
    var jsonData = {};
    jsonData.type = 'login';
    jsonData.username = loginUser.value;
    jsonData.password = loginPass.value;

    connection.send(JSON.stringify(jsonData));
}

function sendRegister () {
    var jsonData = {};
    jsonData.type = 'register';
    jsonData.username = regUser.value;
    jsonData.password = regPass.value;

    connection.send(JSON.stringify(jsonData));
}