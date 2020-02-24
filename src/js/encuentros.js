
var connection = new WebSocket ("wss://ecv-etic.upf.edu/node/9027/ws/");

//var sw = document.querySelector("#switch");
var send = document.querySelector("#send");
var nom = document.querySelector("#name");
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
    msg.name = nom.value;
    msg.subject = sub.value;
    msg.description = des.value;

    console.log(msg)

    connection.send(JSON.stringify(msg));

}