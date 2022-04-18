import React, { useReducer } from "react";
import { useState, useRef, useEffect, useContext } from "react";
import avatar from "./avatarexample.png";
import Message from "./message";
import axios from "axios";
import ReactDOM from "react-dom";
import { useSocket } from "../../context/SocketProvider";
import ListsLoader from "../Project/ListsLoader";
import { UserContext } from "../../context/UserContext";
import link from "../API";
const Chat = (props) => {
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  var counter = 0;
  var messageList;
  const [plusFlag, setPlusFlag] = useState(false);
  const [user, setUser] = useState(props.user != null ? props.user.id : null);
  const [numA, setNumA] = useState(0);
  const elementRef = useRef();
  const inputRef = useRef();
  // const [active, setActive] = useState(false);
  const [userCurrent, setUserCurrent] = useContext(UserContext);
  const [loadUser, setLoadUser] = useState(true);
  const [me, setMe] = useState({ id: 0, leader: false });
  const [lock, setLock] = useState(true);
  var len;
  if (messages == undefined) len = 0;
  else len = messages.length;

  if (props.user != null) {
    if (props.user.id != user) {
      setUser(props.user.id);
      if (messages != undefined) messages.splice(0, messages.length);
    }
  }

  if (loadUser) {
    if (userCurrent.id === "") {
      axios
        .get(link + "/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {
          setUserCurrent({
            token: localStorage.getItem("token"),
            email: value.data.email,
            username: value.data.username,
            notificationNumber: value.data.notificationNumber,
            avatar: value.data.avatar.name,
            avatarSrc: `data:image/png;base64,${value.data.avatar.picture}`,
            id: value.data.id,
          });
        })
        .catch((error) => {
          alert(error);
        })
        .finally((a) => {});
      setLoadUser(false);
    }
  }

  async function fetchMessages() {
    // setActive(true);
    if (props.user != null) {
      axios
        .get(
          link +
            "/users/" +
            user +
            "/me/messages" +
            "?sortBy=createdAt&sortValue=-1&limit=10&skip=" +
            messageList.length,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          // setActive(false);
          if (response.data.length == 10) {
            if (!plusFlag) setPlusFlag(true);
          } else {
            if (plusFlag) setPlusFlag(false);
          }
          if (len === 0) {
            setMessages(response.data.reverse());
          } else {
            setMessages([...response.data.reverse(), ...messages]);
          }
          if (props.obj.messagesFetched) props.obj.messagesFetched(user);
        })
        .catch((err) => {
          // setActive(false);
          alert(err.response.data.err || err.response.data.error);
        });
    }
  }

  useEffect(() => {
    //if(messages!=undefined)
    //messages.splice(0,messages.length);
    fetchMessages();
  }, [user]);

  useEffect(() => {
    //if(messages!=undefined)
    //messages.splice(0,messages.length);
    scrollToBottom();
  }, [typing]);

  if (messages != null) {
    messageList = messages.map(({ _id, text, from, createdAt, dirFlag }) => {
      return (
        <Message
          key={_id}
          time={createdAt}
          dirFlag={from === user ? false : true}
          text={text}
          ind={counter++}
        />
      );
    });
  } else {
    messageList = "";
  }

  const scrollToBottom = () => {
    elementRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (socket) {
      socket.off("new-private-message");
      socket.on("new-private-message", ({ message, numOfUnreadMessages }) => {
        if (userCurrent.id === message.from._id) return;
        if (user !== message.from._id) {
          if (props.obj.messageReceived) {
            props.obj.messageReceived(message.from, numOfUnreadMessages);
          }
          return;
        }
        const msg = {
          _id: message._id,
          text: message.text,
          dirFlag: false,
          createdAt: message.createdAt,
          from: message.from._id,
          ind: 10,
        };
        if (messages != null) {
          setMessages([...messages, msg]);
        } else {
          setMessages([msg]);
        }

        socket.emit("markAsSeen", message._id);
      });
      socket.off("user-started-typing");
      socket.off("user-stopped-typing");
      socket.on("user-started-typing", (contact) => {
        if (user === contact._id) {
          if (!props.isTyping.flag) {
            props.isTyping.flag = true;
            setTyping(true);
          }
        }
      });
      socket.on("user-stopped-typing", (contact) => {
        if (user === contact._id) {
          if (props.isTyping.flag) {
            props.isTyping.flag = false;
            setTyping(false);
          }
        }
      });
    }
  }, [messages]);
  var timeoutId;
  const userStartedTyping = () => {
    if (timeoutId) clearTimeout(timeoutId);
    socket.emit("userStartedTyping", user);
    timeoutId = setTimeout(() => {
      socket.emit("userStoppedTyping", user);
    }, 1500);
  };
  const sendMessage = () => {
    if (inputRef.current.value != null && inputRef.current.value != "") {
      if (socket) {
        socket.emit("newMessageToUser", user, inputRef.current.value);
      }
      const msg = {
        _id: messages.length + 1,
        text: inputRef.current.value,
        dirFlag: true,
        from: userCurrent,
        createdAt: new Date(),
      };
      setMessages([...messages, msg]);
      props.obj.sortContacts(user);
    }
    inputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };
  var avatarSrc;
  var avatarAlt;
  if (props.user != null) {
    avatarSrc = `data:image/png;base64,${props.user.avatar.picture}`;
    avatarAlt = props.user.avatar.name;
  } else avatarAlt = "";
  return (
    <div className="chat">
      <div className="chatBar">
        <img className="ui mini image" src={avatarSrc} alt={avatarAlt} />
        <label className="lab">
          {props.user == null ? "" : props.user.username}
        </label>
      </div>
      <div className="messageList">
        <div className="plusD">
          <div className="arrowIcon">
            {plusFlag === true ? (
              <i
                className="big plus circle icon"
                onClick={() => {
                  fetchMessages();
                }}
              />
            ) : (
              ""
            )}
          </div>
        </div>
        {/* <ListsLoader active={active} height="300px" /> */}
        <div className="messageListWrapper">
          {messageList}
          <div>{typing === true ? `${props.username} is typing...` : ""}</div>
          <div ref={elementRef} style={{ float: "left", clear: "both" }}></div>
        </div>
      </div>

      <div className="messBar">
        <div className="inputD">
          <input
            className="inp"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={userStartedTyping}
            placeholder="Enter message"
          />
        </div>
        <div className="arrowIcon">
          <i
            className="big arrow alternate circle right outline icon"
            onClick={() => {
              sendMessage();
            }}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default Chat;

//{messages===undefined?"":{messageList}}

/* 
return (
    <div>
      <div className="MessageContainer" >
        <div className="MessagesList">
          {this.renderMessages()}
        </div>
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
      </div>
    </div>
  );

  scrollToBottom = () => {
  this.messagesEnd.scrollIntoView({ behavior: "smooth" });
}

componentDidMount() {
  this.scrollToBottom();
}

componentDidUpdate() {
  this.scrollToBottom();
}
*/
