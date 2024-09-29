// const players = [];
// let currentPlayer = null;

// const ticHandler = async (io, socket) => {
//     socket.emit("players", players);

//     // Add the new player to the game
//     if (players.length === 0 || players[players.length - 1].length >= 2) {
//         players.push([socket.id]);
//     } else {
//         players[players.length - 1].push(socket.id);
//     }

//     console.log("Updated players table:", players);

//     if (currentPlayer === null && players.length > 0) {
//         currentPlayer = players[0][0];
//     }

//     io.emit("players", players);
//     io.emit("currentPlayer", currentPlayer); 
//     socket.on("nextSquares", (data) => {
//         if (socket.id === currentPlayer) {
//             io.emit("squares", data);

//             const nextPlayer = players.flat().find(id => id !== currentPlayer);
//             currentPlayer = nextPlayer;
//             io.emit("currentPlayer", currentPlayer);
//         }
//     });

//     socket.on("xIsNext", data => io.emit("changeTurn", data));
//     socket.on("winner", data => io.emit("findWinner", data));

//     // Handle player disconnection
//     socket.on("disconnect", () => {
//         players.forEach((group, index) => {
//             const playerIndex = group.indexOf(socket.id);
//             if (playerIndex !== -1) {
//                 group.splice(playerIndex, 1);
//             }
//             if (group.length === 0) {
//                 players.splice(index, 1);
//             }
//         });

//         console.log("Updated players table after disconnect:", players);

//         if (socket.id === currentPlayer) {
//             const nextPlayer = players.flat()[0];
//             currentPlayer = nextPlayer || null; 
//             io.emit("currentPlayer", currentPlayer);
//         }

//         io.emit("players", players);
//     });
// };

// module.exports = { ticHandler };


const players = []; 
const games = []; 

const ticHandler = async (io, socket) => {

    socket.emit("players", players);

    if (players.length === 0 || players[players.length - 1].length >= 2) {
        players.push([socket.id]); 
        games.push({
            players: [socket.id], 
            board: Array(9).fill(""), 
            xIsNext: true, 
            winner: null,
            currentPlayer: socket.id,
        });
    } else {
        players[players.length - 1].push(socket.id); 
        games[games.length - 1].players.push(socket.id);
    }

    console.log("Updated players table:", players);
    console.log(games);

    const currentGameIndex = games.findIndex(game => game.players.includes(socket.id));

    if (currentGameIndex !== -1) {
        io.to(games[currentGameIndex].players[0]).emit("gameState", games[currentGameIndex]);
        io.to(games[currentGameIndex].players[1]).emit("gameState", games[currentGameIndex]);
        

        socket.on("nextSquares", (nextSquares) => {
            if (games[currentGameIndex].winner) return;

            games[currentGameIndex].board = nextSquares;

            games[currentGameIndex].currentPlayer =  
                        games[currentGameIndex].currentPlayer===games[currentGameIndex].players[0] ?
                        games[currentGameIndex].players[1] : games[currentGameIndex].players[0];

            io.to(games[currentGameIndex].players[0]).emit("squares", nextSquares);
            io.to(games[currentGameIndex].players[1]).emit("squares", nextSquares);
            io.to(games[currentGameIndex].players[0]).emit("gameState", games[currentGameIndex]);
            io.to(games[currentGameIndex].players[1]).emit("gameState", games[currentGameIndex]);
        });

        // Listen for turn change
        socket.on("xIsNext", (xIsNext) => {
            games[currentGameIndex].xIsNext = xIsNext;
            io.to(games[currentGameIndex].players[0]).emit("changeTurn", xIsNext);
            io.to(games[currentGameIndex].players[1]).emit("changeTurn", xIsNext);
        });

        // Listen for a winner
        socket.on("winner", (winner) => {
            games[currentGameIndex].winner = winner;
            io.to(games[currentGameIndex].players[0]).emit("findWinner", winner);
            io.to(games[currentGameIndex].players[1]).emit("findWinner", winner);
        });
    }

    // Handle player disconnection
    socket.on("disconnect", () => {
        players.forEach((group, index) => {
            const playerIndex = group.indexOf(socket.id);
            if (playerIndex !== -1) {
                group.splice(playerIndex, 1);
                const gamePlayerIndex = games[index].players.indexOf(socket.id);
                games[index].players.splice(gamePlayerIndex,1);
                games[index].currentPlayer=games[index].players[0];
            }
            if (group.length === 0) {
                players.splice(index, 1);
                games.splice(index, 1);
            }
        });

        console.log("Updated players table after disconnect:", players);
        console.log(games);
        io.emit("players", players);
    });
};

module.exports = { ticHandler };


