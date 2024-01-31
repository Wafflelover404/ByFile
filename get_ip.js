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

console.log(`Your IP address is: ${ipAddress}`);
