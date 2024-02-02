const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');

const socket = new WebSocket('ws://localhost:3000');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let uniqueId = '';

// Connection opened
socket.on('open', () => {
    console.log('Connected to server');

    // Send a message to the server to request a unique ID
    const request = {
        type: 'recid',
    };
    socket.send(JSON.stringify(request));
});

// Listen for messages from the server
socket.on('message', (data) => {
    const response = JSON.parse(data);

    if (response.type === 'recid') {
        uniqueId = response.id;
        console.log('Received unique ID:', uniqueId);

        // Prompt the user for input
        rl.question('Enter the user ID to send a request: ', (userId) => {
            // Check if the user is the sender or receiver
            rl.question('Are you the sender (Y/N)? ', (answer) => {
                const isSender = answer.toLowerCase() === 'y';

                // Prompt the user for file path
                rl.question('Enter the file path: ', (filePath) => {
                    // Read the file contents
                    fs.readFile(filePath, (err, fileData) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            rl.close();
                            return;
                        }

                        // Send the user ID, sender/receiver information, and file data to the server
                        const request = {
                            type: 'newrequest',
                            from: uniqueId,
                            to: userId,
                            isSender: isSender,
                            fileData: fileData.toString('base64'),
                        };
                        socket.send(JSON.stringify(request));

                        rl.close();
                    });
                });
            });
        });
    }
});

// Connection closed
socket.on('close', () => {
    console.log('Disconnected from server');
});
