
import { Student, Teacher } from './user.js';

var me;

var send = document.querySelector("#send");
var a = document.querySelector("#prof");
var b = document.querySelector("#sub");

send.addEventListener('click', sendInfo);

function sendInfo () {

    me = new Student(a, b, 'login')
}
