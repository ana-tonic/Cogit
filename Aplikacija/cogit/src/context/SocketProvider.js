import React, { useContext, useEffect, useState } from "react";
//import io from "https://cogit-api.herokuapp.com/socket.io/socket.io.js";
//import io from "e:/treca godina/Softversko/Projekat/si.21.45.softver_za_upravljanje_projektima_-_cogit/Aplikacija/cogit/node_modules/socket.io/lib/socket.js";
import { io } from "socket.io-client";
import link from "../components/API";

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState();
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);

  const token = localStorage.getItem("token");

  function createSocket() {
    const newSocket = io(link, {
      auth: {
        token: token,
      },
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }
  if (a && b) {
    setTimeout(() => {
      setA(true);
      if (token) {
        createSocket();
        setB(false);
      }
    }, 2000);
    setA(false);
  }

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
