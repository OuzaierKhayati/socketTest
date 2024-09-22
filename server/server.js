const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000', // This should match the client URL
        methods: ["GET", "POST"], // Optional, specify allowed methods
        credentials: true // Optional, if you need to include cookies in requests
    }
});

let playerSocres = [];

io.on("connection", (socket) => {

    socket.emit("playerScores", playerSocres);
    
    socket.on("scores", (data) => {
        playerSocres.push({...data, id: socket.id});

        io.emit("playerScores", playerSocres);
    });

    socket.on("updateScores", ()=>{
        io.emit("playerScores", playerSocres);
    })
});

httpServer.listen(5000, () => {
    console.log("Server is running on port 5000");
});
