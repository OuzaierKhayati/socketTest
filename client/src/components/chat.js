import React, { useContext, useEffect,useRef, useState } from "react";
import { SocketContext } from "../socketContext";

function Chat() {
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState({ msg: "" });
    const [allMessages, setAllMessages] = useState([]);
    const [myId, setMyId] = useState("");
    const inputRef = useRef(null);

    // Get the socket ID when the component mounts
    useEffect(() => {
        socket.on("tranID", (id) => {
            setMyId(id);
        });

        // Clean up the socket event when the component unmounts
        return () => socket.off("tranID");
    }, [socket]);

    function handleInput(event) {
        let { name, value } = event.target;
        setMessage((prevMessage) => ({
            ...prevMessage,
            [name]: value,
        }));
    }

    function send() {
        if (message.msg) {
            socket.emit("messages", message);
            setMessage({ msg: "" });
            inputRef.current.focus();
        }
    }

    useEffect(() => {
        socket.on("allMessages", (data) => {
            setAllMessages(data);
        });

        return () => socket.off("allMessages");
    }, [socket]);

    return (
        <>
            <div className="chatBox">
                {allMessages.map((allMessage, index) => (
                    <p
                        key={index}
                        className={
                            allMessage.id === myId
                                ? "message-right"
                                : "message-left"
                        }
                    >
                        {allMessage.msg}
                    </p>
                ))}
            </div>
            <input 
                className="input-field"
                name="msg" 
                placeholder="Type your message" 
                onChange={handleInput} 
                value={message.msg}
                ref={inputRef} 
            />
            <button onClick={send}>Send</button>
        </>
    );
}

export default Chat;
