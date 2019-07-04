const WebSocketServer = require('websocket').server;
let connection = null;

exports.createWsServer = server => {
    const wsServer = new WebSocketServer({
        httpServer: server
    });
    wsServer.on('request', request => {
        connection = request.accept(null, request.origin);

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log(message.utf8Data);
            }
            if (message.utf8Data === 'ping') {
                connection.sendUTF('pong');
            }
        });
        connection.on('close', connection => {
            console.log('close', connection);
        });
    });
};
