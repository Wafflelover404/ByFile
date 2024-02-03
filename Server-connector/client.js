const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');

function connectToServer() {
    const socket = new WebSocket('ws://localhost:3000');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let userId;
    let role;

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
            userId = response.id;
            console.log('Received unique ID:', userId);

            // Prompt the user to enter the ID of the second user
            rl.question('Enter the ID of the second user: ', (secondUserId) => {
                // Send the ID of the second user to the server
                const secondUserRequest = {
                    type: 'seconduser',
                    secondUserId,
                };
                socket.send(JSON.stringify(secondUserRequest));
            });
        } else if (response.type === 'role') {
            const matchedUserId = response.userId;
            rl.question(`You have been matched with ${matchedUserId}. Enter your role ('sender' or 'receiver'): `, (selectedRole) => {
                role = selectedRole;
                // Send the selected role to the server
                const roleRequest = {
                    type: 'role',
                    userId: matchedUserId,
                    role: selectedRole,
                };
                socket.send(JSON.stringify(roleRequest));

                if (role === 'sender') {
                    // Prompt the sender to enter the path to the file
                    rl.question('Enter the path to the file: ', (filePath) => {
                        // Read the file and convert it to a Data URL
                        const fileData = fs.readFileSync(filePath);
                        const mimeType = mimeTypes.lookup(filePath);
                        const dataUrl = `data:${mimeType};base64,${fileData.toString('base64')}`;

                        // Send the Data URL to the server
                        const fileRequest = {
                            type: 'fileData',
                            dataUrl,
                        };
                        socket.send(JSON.stringify(fileRequest));
                    });
                }
            });
        } else if (response.type === 'connect') {
            console.log('You have been connected with another user.');

            // Perform any necessary actions to establish the connection between the devices
            // For example, you can start a video call or initiate a data transfer.
        } else if (response.type === 'notification') {
            console.log('Notification:', response.message);
        } else if (response.type === 'fileData') {
            console.log('Received file data from sender');

            // Write the file to the current directory
            const fileName = `received_file_${Date.now()}`;
            const filePath = path.join(__dirname, fileName);
            const fileDataUrl = response.dataUrl;

            // Extract the base64 data from the Data URL
            const base64Data = fileDataUrl.split(',')[1];

            // Write the file asynchronously
            fs.writeFile(filePath, base64Data, 'base64', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    console.log('File written successfully:', fileName);
                }
            });
        }
    });

    // Connection closed
    socket.addEventListener('close', () => {
        console.log('Disconnected from server');
    });
}

// Usage: Call the function to connect to the server
connectToServer();
