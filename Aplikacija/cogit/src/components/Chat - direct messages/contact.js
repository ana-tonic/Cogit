import React from "react";
import avatar from "./avatarexample.png";
import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketProvider";
const Contact = (props) => {
  const socket = useSocket();

  const [status, setStatus] = useState(props.active); // neka mu posalje roditelj

  const con = () => {
    const avatarSrc = `data:image/png;base64,${props.avatar.picture}`;
    return (
      <div className="contPart" onClick={contactClicked}>
        <img
          className="ui mini image"
          src={avatarSrc}
          alt={props.avatar.name}
        />
        <label className="lab">{props.username}</label>
        {status == true ? <i className="green circle icon"></i> : ""}
      </div>
    );
  };

  useEffect(() => {
    if (socket) {
      socket.on("user-status-changed", ({ userId, active }) => {
        if (props.id == userId) setStatus(active);
      });
    }
  }, []);
  const contactClicked = () => {
    props.setUser({
      username: props.username,
      id: props.id,
      avatar: props.avatar,
    });
  };
  if (props.rmvFlag === true) {
    return (
      <div className="contact">
        {con()}
        <div className="numOfMessagesWrapper">
          {props.unreadMessages > 0 ? (
            <span className="numOfMessages">{props.unreadMessages}</span>
          ) : (
            <div></div>
          )}
          <i
            className="big red minus circle icon"
            onClick={() => {
              props.removeMe(props.ind, props.username);
            }}
          ></i>
        </div>
      </div>
    );
  } else {
    return (
      <div className="contact" onClick={contactClicked}>
        {con()}
        <div className="numOfMessagesWrapper">
          {props.unreadMessages > 0 ? (
            <span className="numOfMessages">{props.unreadMessages}</span>
          ) : (
            ""
          )}
          <div></div>
        </div>
      </div>
    );
  }
};

export default Contact;
