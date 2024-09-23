import { createContext } from 'react';
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin ;

export const socket = io(SOCKET_URL);
export const SocketContext = createContext(socket);