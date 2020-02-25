
import { Student, Teacher } from './user.js';

var me;

var userLog = document.querySelector("#userLog");
var passLog = document.querySelector("#passLog");
var sendLog = document.querySelector("#sendLog");

var userReg = document.querySelector("#userReg");
var passReg = document.querySelector("#passReg");
var sendReg = document.querySelector("#sendReg");

var logout = document.querySelector("#logout");

var requestSub = document.querySelector("#requestSub");
var requestDesc = document.querySelector("#requestDesc");
var sendReq = document.querySelector("#sendReq");

var seminarSub = document.querySelector("#seminarSub");
var seminarTeach = document.querySelector("#seminarTeach");
var appSem = document.querySelector("#appSem");

var msg = document.querySelector("#msg");
var msgSub = document.querySelector("#msgSub");
var sendMess = document.querySelector("#sendMess");

sendLog.addEventListener('click', sendLogin);
sendReg.addEventListener('click', sendRegister);
sendReq.addEventListener('click', sendRequest);
appSem.addEventListener('click', sendApply);
sendMess.addEventListener('click', sendMessage);
logout.addEventListener('click', sendLogout);

function sendLogin () {
    me = new Student(userLog.value, passLog.value, 'login');
}
function sendRegister () {
    me = new Student(userReg.value, passReg.value, 'register');
}
function sendLogout () {
    me.logOut();
}
function sendRequest () {
    me.createRequest(requestSub.value, requestDesc.value);
}
function sendApply () {
    me.applySeminar(seminarSub.value, seminarTeach.value);
}
function sendMessage () {
    me.sendMsg(msg.value, msgSub.value);
}