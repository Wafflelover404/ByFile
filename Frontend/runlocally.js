const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'userpart.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
