let drawBoard = [];

const drawHandler = async (io, socket) => {
  socket.emit("draw", drawBoard);
  socket.on("draw", (msg) => {
    drawBoard = msg;
    io.emit("draw", msg);
  });
};

module.exports = { drawHandler };