import React, { useEffect } from "react";
import Chat from "./chat";
import Contacts from "./listOfContacts";
import "./style3.css";
import { useState } from "react";
import ListsLoader from "../Project/ListsLoader";

const ChatPage = (props) => {
  const [user, setUser] = useState(null);
  // const [active, setActive] = useState(true);

  var obj = {};
  var isTyping = {};
  return (
    <div className="chatPage">
      <Contacts
        setUser={setUser}
        user={user}
        // setActive={setActive}
        obj={obj}
      />
      {/* <ListsLoader active={active} height="300px" /> */}
      {user != null ? (
        <Chat
          username={user.username}
          user={user}
          obj={obj}
          isTyping={isTyping}
        />
      ) : (
        <div className="messageListPlaceHolder"></div>
      )}
    </div>
  );
};

export default ChatPage;
