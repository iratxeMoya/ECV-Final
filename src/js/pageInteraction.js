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
    projListContainer,
    enterProj,
    projSelectPage,
    codeEditorPage
} from './DOMAccess.js';
import {connection} from './init.js';
import { actualProject } from './utils.js';

goToLog.addEventListener("click", toggleLogReg);
goToReg.addEventListener("click", toggleLogReg);
loginSend.addEventListener("click", sendLogin);
regSend.addEventListener("click", sendRegister);
createProj.addEventListener("click", createProject);
addUser.addEventListener("click", addUserToProj);
enterProj.addEventListener("click", enterProject);

function enterProject () {

    var jsonData = {};
    jsonData.type = 'enterProj';
    jsonData.project = actualProject;

    projSelectPage.classList.toggle("show");
    codeEditorPage.classList.toggle("show");

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
    element.addEventListener('click', deleteUser); //funcion no creada aun

    projInfoContainer.appendChild(element);
}

function createProject () {
    var jsonData = {};
    jsonData.type = 'createProject';
    jsonData.name = projName.value;

    connection.send(JSON.stringify(jsonData));

    var element = document.createElement("span");
    element.innerText = projName.value;
    element.addEventListener("click", requestProjInfo);
    requestProjInfo.classList.toggle("show");

    projListContainer.appendChild(element);
}

function toggleLogReg() {
    regPage.classList.toggle("show");
    loginPage.classList.toggle("show");
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