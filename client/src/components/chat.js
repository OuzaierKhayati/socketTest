import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { SocketContext } from "../socketContext";

function Chat() {
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState({ msg: "" });
    const [allMessages, setAllMessages] = useState([]);
    const [myId, setMyId] = useState(localStorage.getItem('myId') || "");
    const [userName, setUserName] = useState(""); // State for user's name
    const [isNameSet, setIsNameSet] = useState(false); // State to track if the name is set
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

    function handleNameChange(event) {
        setUserName(event.target.value); // Update user's name
    }

    function setName() {
        // This will set the username when the button is clicked
        if (userName) {
            socket.emit("setUserName", userName); // Emit event to set the username on the server if needed
            setIsNameSet(true); // Set the name confirmation state
        }
    }

    function send() {
        if (message.msg && userName) {
            // Include user's name in the message
            socket.emit("messages", { ...message, name: userName });
            setMessage({ msg: "" });
            inputRef.current.focus();
        }
    }

    return (
        <>
            {!isNameSet ? (
                // If the name is not set, show input for the user to enter their name
                <div className="nameInput">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={handleNameChange} // Controlled input
                    />
                    <button onClick={setName}>Set Name</button>
                </div>
            ) : (
                // Chat UI
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
                                <strong>{allMessage.name}: </strong> {/* Display user's name */}
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
            )}
        </>
    );
}

export default Chat;
