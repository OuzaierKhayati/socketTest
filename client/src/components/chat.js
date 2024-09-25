import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { SocketContext } from "../socketContext";

function Chat() {
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState({ msg: "" });
    const [allMessages, setAllMessages] = useState([]);
    const [myId, setMyId] = useState(localStorage.getItem('myId') || "");

    const inputRef = useRef(null);

    // Use useCallback to memoize the requestMyId function
    const requestMyId = useCallback(() => {
        socket.emit("requestMyId", {}, (id) => {
            setMyId(id);
            localStorage.setItem('myId', id);
        });
    }, [socket]);

    // Get the socket ID when the component mounts
    useEffect(() => {
        requestMyId();

        socket.on("tranID", (id) => {
            setMyId(id);
            localStorage.setItem('myId', id);
        });

        socket.emit("getMessages", {}, (data) => {
            setAllMessages(data);
        });

        return () => {
            socket.off("tranID");
            socket.off("allMessages");
        };
    }, [socket, requestMyId]);

    useEffect(() => {
        // Listen for new messages
        socket.on("allMessages", (data) => {
            setAllMessages(data);
        });

        return () => {
            socket.off("allMessages");
        };
    }, [socket]);

    function handleInput(event) {
        const { name, value } = event.target;
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
