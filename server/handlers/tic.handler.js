const ticHandler = async (io, socket) => {
    
    socket.on("nextSquares", data => io.emit("squares", data));
    socket.on("xIsNext", data => io.emit("changeTurn", data));
    socket.on("winner", data => io.emit("findWinner", data));
};

module.exports = { ticHandler };