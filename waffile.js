const net = require('net');
const fs = require('fs');
const path = require('path');

const filePath = '/home/wafflelover404/Desktop/Untitled 1.pptx';
const serverAddress = '192.168.100.10'; // Replace with the server's IP address

const client = new net.Socket();

client.connect(3000, serverAddress, () => {
    console.log('Connected to server.');

    const fileName = path.basename(filePath);
    const fileExtension = path.extname(fileName);

    // Send the file name and extension before sending the file content
    client.write(fileName);

    const fileStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });

    fileStream.on('data', (chunk) => {
        client.write(chunk);
    });

    fileStream.on('end', () => {
        console.log('File sent.');
        client.end();
    });
});
