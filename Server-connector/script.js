const WebSocket = require('ws');
const fs = require('fs');
const mimeTypes = require('mime-types');
const wss = new WebSocket.Server({ port: 7102 });

const connectedUsers = new Map();
const pendingRequests = [];

wss.on('connection', (ws) => {
    const userId = generateUniqueId();
    connectedUsers.set(userId, { ws, role: null });

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
                (req) => req.from === secondUserId && req.to === senderId
            );

            if (pendingRequest) {
                // Remove the pending request
                pendingRequests.splice(pendingRequests.indexOf(pendingRequest), 1);

                // Prompt the users to select their role
                const senderRoleRequest = {
                    type: 'role',
                    userId: senderId,
                };
                const secondUserRoleRequest = {
                    type: 'role',
                    userId: secondUserId,
                };
                const senderWs = connectedUsers.get(senderId).ws;
                const secondUserWs = connectedUsers.get(secondUserId).ws;
                senderWs.send(JSON.stringify(senderRoleRequest));
                secondUserWs.send(JSON.stringify(secondUserRoleRequest));

                console.log(`Match found: ${senderId} and ${secondUserId}`);
            } else {
                // Add the request to the pending requests list
                pendingRequests.push({ from: senderId, to: secondUserId });
            }
        } else if (request.type === 'role') {
            const { userId, role } = request;

            // Update the role of the user in the connectedUsers map
            const user = connectedUsers.get(userId);
            user.role = role;

            if (role === 'sender') {
                // Perform actions for the 'sender' role
                user.ws.send(JSON.stringify({ type: 'notification', message: 'You have been assigned as the sender.' }));

                // Prompt the sender to enter the file path
                user.ws.send(JSON.stringify({ type: 'notification', message: 'Please enter the file path:' }));
            } else if (role === 'receiver') {
                // Perform actions for the 'receiver' role
                user.ws.send(JSON.stringify({ type: 'notification', message: 'You have been assigned as the receiver.' }));
            }

            // Check if both users have selected their roles
            const usersWithRoles = Array.from(connectedUsers.values()).filter(user => user.role !== null);
            if (usersWithRoles.length === 2) {
                const sender = usersWithRoles.find(user => user.role === 'sender');
                const receiver = usersWithRoles.find(user => user.role === 'receiver');

                // Send a 'connect' message to both users
                sender.ws.send(JSON.stringify({ type: 'connect', partnerId: receiver.userId }));
                receiver.ws.send(JSON.stringify({ type: 'connect', partnerId: sender.userId }));

                // Prompt the sender to enter the file path
                sender.ws.send(JSON.stringify({ type: 'notification', message: 'Please enter the file path:' }));
            }
        } else if (request.type === 'fileData') {
            const { dataUrl } = request;
            const senderId = getUserIdByWebSocket(ws);

            // Find the sender and receiver based on their user IDs
            const sender = Array.from(connectedUsers.values()).find(user => user.role === 'sender');
            const receiver = Array.from(connectedUsers.values()).find(user => user.role === 'receiver');

            if (sender && receiver) {
                // Redirect the file data from the sender to the receiver
                receiver.ws.send(JSON.stringify({ type: 'fileData', dataUrl })); // Send the file data to the receiver's WebSocket connection
                console.log('File data sent to receiver');
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
    for (const [userId, user] of connectedUsers.entries()) {
        if (user.ws === ws) {
            return userId;
        }
    }
    return null;
}
