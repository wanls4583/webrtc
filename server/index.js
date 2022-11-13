const WebSocket = require('ws');

var connMap = {};
var id = 0;
var DO_OFFER = 1;
var DO_ANSWER = 2;
var SET_DESC = 3;
var ICE_CANDIDATE = 4;

const webSocketServer = new WebSocket.Server({
	port: 8081
});

webSocketServer.on('listening', () => {
	console.log('web socket begins listening');
});

webSocketServer.on('connection', function connection(conn) {
	var userId = id++;
	console.log("New connection:", userId);
	connMap[userId] = conn;
	conn.userId = userId;
	conn.on("message", function(str) {
		try {
			var message = JSON.parse(str);
			console.log('recieve', userId, message.type);
			switch (message.type) {
				case DO_OFFER:
					broadcast(userId, {
						type: DO_ANSWER,
						data: message.data
					});
					break;
				case ICE_CANDIDATE:
					broadcast(userId, {
						type: ICE_CANDIDATE,
						data: message.data
					});
					break;
				case DO_ANSWER:
					broadcast(userId, {
						type: SET_DESC,
						data: message.data
					});
			}
		} catch (e) {
			console.log(e);
		}
	});
	conn.on("close", function(code, reason) {
		console.log("Connection closed:", userId);
	});
});

function broadcast(userId, msg) {
	var type = msg.type;
	msg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
	webSocketServer.clients.forEach(function(conn) {
		if (conn.userId !== userId) {
			conn.send(msg);
			console.log('send', conn.userId, type);
		}
	});
}