
var HOST = location.origin.replace(/^http/, 'ws')
var connection = new WebSocket (HOST);

export {
    connection,
}
