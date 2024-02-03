const WebSocket = require('ws');
const readline = require('readline');

function connectToServer() {
    const socket = new WebSocket('ws://localhost:3000');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Connection opened
    socket.addEventListener('open', () => {
        console.log('Connected to server');

        // Send a message to the server to request a unique ID
        const request = {
            type: 'recid',
        };
        socket.send(JSON.stringify(request));
    });

    // Listen for messages from the server
    socket.addEventListener('message', (event) => {
        const response = JSON.parse(event.data);

        if (response.type === 'recid') {
            const uniqueId = response.id;
            console.log('Received unique ID:', uniqueId);

            // Prompt the user to enter the ID of the second user
            rl.question('Enter the ID of the second user: ', (secondUserId) => {
                // Send the ID of the second user to the server
                const secondUserRequest = {
                    type: 'seconduser',
                    secondUserId,
                };
                socket.send(JSON.stringify(secondUserRequest));
            });
        } else if (response.type === 'connect') {
            console.log('You have been connected with another user.');

            // Perform any necessary actions to establish the connection between the devices
            // For example, you can start a video call or initiate a data transfer.
        } else if (response.type === 'role') {
            const userId = response.userId;
            rl.question(`You have been matched with ${userId}. Enter your role ('sender' or 'receiver'): `, (role) => {
                // Send the selected role to the server
                const roleRequest = {
                    type: 'role',
                    userId,
                    role,
                };
                socket.send(JSON.stringify(roleRequest));
            });
        } else if (response.type === 'notification') {
            console.log('Notification:', response.message);
        }
    });

    // Connection closed
    socket.addEventListener('close', () => {
        console.log('Disconnected from server');
    });
}

// Usage: Call the function to connect to the server
connectToServer();
