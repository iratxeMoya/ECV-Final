
var connection = new WebSocket ("wss://ecv-etic.upf.edu/node/9027/ws/");

//var sw = document.querySelector("#switch");
var send = document.querySelector("#send");
var name = document.querySelector("#name");
var sub = document.querySelector("#sub");
var des = document.querySelector("#des");

// sw.addEventListener("click", switchUserType);

// function switchUserType () {
//     console.log('switched');
// }

send.addEventListener("click", createClass);

function createClass () {

    var msg = {};
    msg.type = 'createSeminar';
    msg.name = name.value;
    msg.subject = sub.value;
    msg.description = des.value;

    connection.send(JSON.stringify(msg));

}