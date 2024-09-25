let allMessages = [];

const chatHandler = async (io, socket, bool) => {
    if(bool){
        socket.emit("allMessages", allMessages);
        socket.on("messages", (data) => {
            allMessages.push({ ...data, id: socket.id });
            io.emit("allMessages", allMessages);
        });
        socket.on("getMessages", (data, callback) => {
            callback(allMessages);
        });
    }else{
        allMessages = allMessages.filter(user => user.id !== socket.id);
        io.emit("allMessages",allMessages );
    }
};

module.exports = { chatHandler };