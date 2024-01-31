const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function writeFilePath(filePath) {
    fs.writeFile('output.txt', filePath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File path written to output.txt');
        app.quit(); // Close the application after writing the file path
    });
}

app.on('ready', () => {
    dialog
        .showOpenDialog({
            properties: ['openFile'],
        })
        .then((result) => {
            const filePath = result.filePaths[0];
            if (filePath) {
                writeFilePath(filePath);
            }
        })
        .catch((err) => {
            console.error(err);
            app.quit(); // Close the application if an error occurs during file selection
        });
});
