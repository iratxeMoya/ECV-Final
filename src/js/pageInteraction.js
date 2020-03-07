import {codeEditorPage, loginPage,loginPass,loginSend,loginUser, regPage, regPass, regSend,regUser,goToLog,goToReg } from './DOMAccess.js';
import {connection} from './init.js';

goToLog.addEventListener("click", toggleLogReg);
goToReg.addEventListener("click", toggleLogReg);
loginSend.addEventListener("click", sendLogin);
regSend.addEventListener("click", sendRegister);

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