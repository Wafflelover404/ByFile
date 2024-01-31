const net = require('net');
const fs = require('fs');
const path = require('path');

const server = net.createServer(socket => {
    console.log('Client connected.');

    let fileName = '';
    let fileExtension = '';

    socket.on('data', (data) => {
        if (fileName === '' && fileExtension === '') {
            // Extract the file name from the received data
            fileName = data.toString();

            // Create a writable stream with the received file name and extension
            const fileStream = fs.createWriteStream(fileName);
            socket.pipe(fileStream);
        } else {
            // Continue writing the rest of the file content
            socket.write(data);
        }
    });

    socket.on('end', () => {
        console.log('File transfer complete.');
        server.close();
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
