const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the admin-panel directory
app.use(express.static(path.join(__dirname, 'app/admin-panel')));
app.use(express.json());

// Serve the logo
app.get('/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'app/admin-panel/logo.png'));
});

// Start the server
app.listen(port, () => {
    console.log(`Admin panel running at http://localhost:${port}`);
});