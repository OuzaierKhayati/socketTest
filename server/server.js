const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');  // Built-in Node.js module to work with file paths

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000', // Use your client URL or Render/Railway URL if hosted
        methods: ["GET", "POST"], // Optional, specify allowed methods
        credentials: true // Optional, if you need to include cookies in requests
    }
});

let playerScores = [];

// Handle Socket.io connections
io.on("connection", (socket) => {
    socket.emit("playerScores", playerScores);
    
    socket.on("scores", (data) => {
        playerScores.push({ ...data, id: socket.id });
        io.emit("playerScores", playerScores);
    });

    socket.on("updateScores", () => {
        io.emit("playerScores", playerScores);
    });
});

// Serve static files from the React app's build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// Any request that doesn't match an API route should serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
