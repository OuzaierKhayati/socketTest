const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');
const { drawHandler } = require("./handlers/draw.handler");
const { chatHandler } = require('./handlers/chat.handler');
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000', // Update this as needed
        methods: ["GET", "POST"],
        credentials: true
    }
});

let playerScores = [];

// Handle Socket.io connections
io.on("connection", (socket) => {
    console.log('A user connected:', socket.id);
    socket.emit("playerScores", playerScores);
    socket.emit("tranID", socket.id)
    
    socket.on("scores", (data) => {
        playerScores.push({ ...data, id: socket.id });
        io.emit("playerScores", playerScores);
    });

    socket.on("updateScores", () => {
        io.emit("playerScores", playerScores);
    });

    socket.on("disconnect", () => {
        console.log('User disconnected:', socket.id);
        // Remove the player's scores if needed
        playerScores = playerScores.filter(player => player.id !== socket.id);
        io.emit("playerScores", playerScores);

        chatHandler(io,socket,false);
    });
    
    drawHandler(io, socket);
    chatHandler(io,socket,true);
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
