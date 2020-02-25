
import { Student, Teacher } from './user.js';

var me;

var send = document.querySelector("#send");
var a = document.querySelector("#prof");
var b = document.querySelector("#sub");
var sendMsgB = document.querySelector("#sendMsg");
var m = document.querySelector("#msg");

send.addEventListener('click', sendInfo);
sendMsgB.addEventListener('click', sendMsgC);

function sendMsgC () {
    me.sendMsg(m.value);
}

function sendInfo () {

    me = new Student(a, b, 'login')
}
