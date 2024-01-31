const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const net = require('net');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');
}

function pickFileAndWritePath() {
    dialog
        .showOpenDialog({
            properties: ['openFile'],
        })
        .then((result) => {
            const filePath = result.filePaths[0];
            if (filePath) {
                fs.writeFile('output.txt', filePath, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('File path written to output.txt');

                    // Read and process the file
                    readAndSendFile(filePath);
                });
            }
        })
        .catch((err) => {
            console.error(err);
            app.quit(); // Close the application if an error occurs during file selection
        });
}

function readAndSendFile(filePath) {
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
            app.quit(); // Close the application after sending the file
        });
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    pickFileAndWritePath();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
