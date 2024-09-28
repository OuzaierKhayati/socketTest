const players = [];
let currentPlayer = null;

const ticHandler = async (io, socket) => {
    socket.emit("players", players);

    // Add the new player to the game
    if (players.length === 0 || players[players.length - 1].length >= 2) {
        players.push([socket.id]);
    } else {
        players[players.length - 1].push(socket.id);
    }

    console.log("Updated players table:", players);

    if (currentPlayer === null && players.length > 0) {
        currentPlayer = players[0][0];
    }

    io.emit("players", players);
    io.emit("currentPlayer", currentPlayer); 
    socket.on("nextSquares", (data) => {
        if (socket.id === currentPlayer) {
            io.emit("squares", data);

            const nextPlayer = players.flat().find(id => id !== currentPlayer);
            currentPlayer = nextPlayer;
            io.emit("currentPlayer", currentPlayer);
        }
    });

    socket.on("xIsNext", data => io.emit("changeTurn", data));
    socket.on("winner", data => io.emit("findWinner", data));

    // Handle player disconnection
    socket.on("disconnect", () => {
        players.forEach((group, index) => {
            const playerIndex = group.indexOf(socket.id);
            if (playerIndex !== -1) {
                group.splice(playerIndex, 1);
            }
            if (group.length === 0) {
                players.splice(index, 1);
            }
        });

        console.log("Updated players table after disconnect:", players);

        if (socket.id === currentPlayer) {
            const nextPlayer = players.flat()[0];
            currentPlayer = nextPlayer || null; 
            io.emit("currentPlayer", currentPlayer);
        }

        io.emit("players", players);
    });
};

module.exports = { ticHandler };
