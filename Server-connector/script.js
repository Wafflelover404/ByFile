const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

const connectedUsers = new Map();
const pendingRequests = [];

wss.on('connection', (ws) => {
    const userId = generateUniqueId();
    connectedUsers.set(userId, ws);

    ws.on('message', (message) => {
        const request = JSON.parse(message);

        if (request.type === 'recid') {
            const response = {
                type: 'recid',
                id: userId,
            };
            ws.send(JSON.stringify(response));
        } else if (request.type === 'seconduser') {
            const { secondUserId } = request;
            const senderId = getUserIdByWebSocket(ws);

            // Check if there is a pending request from the second user to the sender
            const pendingRequest = pendingRequests.find(
                (req) => (req.from === secondUserId && req.to === senderId)
            );

            if (pendingRequest) {
                // Remove the pending request
                pendingRequests.splice(pendingRequests.indexOf(pendingRequest), 1);

                // Send notifications to both users
                const senderWs = connectedUsers.get(senderId);
                const secondUserWs = connectedUsers.get(secondUserId);

                senderWs.send(JSON.stringify({ type: 'notification', message: 'You are now connected with the second user.' }));
                secondUserWs.send(JSON.stringify({ type: 'notification', message: 'You are now connected with the sender user.' }));

                console.log(`Match found: ${senderId} and ${secondUserId}`);
            } else {
                // Add the request to the pending requests list
                pendingRequests.push({ from: senderId, to: secondUserId });
            }
        }
    });

    ws.on('close', () => {
        const userId = getUserIdByWebSocket(ws);
        connectedUsers.delete(userId);
    });
});

function generateUniqueId() {
    return Math.random().toString(36).substring(2, 8);
}

function getUserIdByWebSocket(ws) {
    for (const [userId, userWs] of connectedUsers.entries()) {
        if (userWs === ws) {
            return userId;
        }
    }
    return null;
}
