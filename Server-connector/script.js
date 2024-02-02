const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Generate individual IDs for users
const generateUniqueId = () => {
    let counter = 0;
    return () => {
        counter++;
        return counter.toString();
    };
};

const generateId = generateUniqueId();

// Store user interests, WebSocket connections, and file data
const users = new Map();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        console.log('Received message:', message);

        const request = JSON.parse(message);

        if (request.type === 'recid') {
            const uniqueId = generateId();
            const response = {
                type: 'recid',
                id: uniqueId,
            };
            ws.send(JSON.stringify(response));

            // Store the WebSocket connection with the unique ID
            users.set(uniqueId, {
                ws,
                fileData: null,
            });
        } else if (request.type === 'newrequest') {
            const from = request.from;
            const to = request.to;
            const isSender = request.isSender;
            const fileData = request.fileData;

            // Check if the "to" user exists and has a matching interest
            if (users.has(to) && users.has(from) && to !== from) {
                const fromUser = users.get(from);
                const toUser = users.get(to);

                // Store the file data for the sender
                if (isSender) {
                    fromUser.fileData = fileData;
                }

                // If both sender and receiver have file data, initiate file transfer
                if (fromUser.fileData && toUser.fileData) {
                    // Save the file for the receiver
                    const filePath = `received_files/${to}-${from}.txt`;
                    fs.writeFile(filePath, fromUser.fileData, (err) => {
                        if (err) {
                            console.error('Error saving file:', err);
                            return;
                        }
                        console.log(`File saved as: ${filePath}`);

                        // Clear the file data for both sender and receiver
                        fromUser.fileData = null;
                        toUser.fileData = null;
                    });
                }
            }
        } else {
            // Process other types of messages and send appropriate responses
            const response = `Server received message: ${message}`;
            ws.send(response);
        }
    });

    // Handle WebSocket disconnection
    // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('Client disconnected');

        // Remove the WebSocket connection and file data from the users map
        const userEntry = Array.from(users.entries()).find(([key, value]) => value.ws === ws);
        if (userEntry) {
            const userId = userEntry[0];
            users.delete(userId);
        }
    });

});

// Start the server
server.listen(3000, () => {
    console.log('Server started on port 3000');
});
