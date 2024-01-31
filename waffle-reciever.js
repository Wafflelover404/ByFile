const net = require('net');
const fs = require('fs');
const path = require('path');
const os = require('os');

const interfaces = os.networkInterfaces();
let ipAddress;

Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
        if (interface.family === 'IPv4' && !interface.internal) {
            ipAddress = interface.address;
        }
    });
});

const server = net.createServer(socket => {
    console.log('Client connected.');

    let fileName = '';
    let fileExtension = '';

    socket.on('data', (data) => {
        if (fileName === '' && fileExtension === '') {
            // Extract the file name from the received data
            fileName = data.toString();

            // Create a writable stream with the received file name and extension
            const filePath = path.join('/home/wafflelover404/Desktop/test-empty', fileName);
            const fileStream = fs.createWriteStream(filePath);
            console.log('File written');
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
    console.log(`Your IP address is: ${ipAddress}`);
});
