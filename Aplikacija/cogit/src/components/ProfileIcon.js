import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import link from "./API";
import axios from "axios";

function ProfileIcon({ currTeam }) {
  const [notifNumber, setNotifNumber] = useState(0);
  const [socketSetup, setSocketSetup] = useState(true);
  const socket = useSocket();
  if (socketSetup) {
    if (socket) {
      //console.log("socket on new-notification");
      socket.off("new-notification");
      socket.on("new-notification", (notif) => {
        if (notif)
          if (notif.notificationNumber !== undefined) {
            setNotifNumber(notif.notificationNumber);
          } else console.log(notif);
      });
      setSocketSetup(false);
    }
  }
  async function getNotifNum() {
    axios
      .get(link + "/users/me/notification-number", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((value) => {
        //console.log(value.data.newNotificationsNumber);
        setNotifNumber(value.data.newNotificationsNumber);
      })
      .catch((error) => {
        alert(error);
      })
      .finally((a) => {});
  }

  useEffect(() => {
    getNotifNum();
  }, []);
  return (
    <div className="Upper">
      <div className="NavProfile">
        <img
          src="../Screenshot_1.jpg"
          width="30px"
          height="30px"
          alt=""
          style={{ marginRight: "5px" }}
        />
        Cogit
        <Link to={`/`} style={{ color: "#42a9ac" }}>
          <i
            className="arrow alternate circle up icon big link  icon"
            style={{ margin: "10px" }}
          ></i>
        </Link>
        <Link to={`/${currTeam}/Profile`} style={{ color: "#42a9ac" }}>
          <i
            className="user big link circle icon"
            style={{ margin: "10px" }}
          ></i>
        </Link>
      </div>
      <div className="ui buttons">
        <Link
          style={{
            position: "relative",
            backgroundColor: "rgba(107, 185, 248, 0.801)",
          }}
          to={`/${currTeam}/Activity`}
          className="ui button navTop"
        >
          <div>
            <i className="bell outline icon"></i>
            Activity
          </div>
          <div
            style={{
              left: "90%",
              zIndex: "1",
              display: notifNumber === 0 ? "none" : "",
            }}
            className="floating ui red label"
          >
            {notifNumber}
          </div>
        </Link>
        <Link
          to={`/${currTeam}/Calendar`}
          className="ui button navTop"
          style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
        >
          <div>
            <i className="calendar alternate outline icon"></i>
            Calendar
          </div>
        </Link>
        <Link
          style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
          to={`/${currTeam}/DirectMessages`}
          className="ui button navTop"
        >
          <div>
            <i className="comment outline icon"></i>
            Direct messages
          </div>
        </Link>
        <Link
          style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
          to={`/${currTeam}/TeamMembers`}
          className="ui button navTop"
        >
          <div>
            <i className="users icon"></i>
            Team members
          </div>
        </Link>
        <Link
          style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
          to={`/${currTeam}/TeamNotes`}
          className="ui button navTop"
        >
          <div>
            <i className="pencil alternate icon"></i>
            Team notes
          </div>
        </Link>
      </div>
    </div>
  );
}

export default ProfileIcon;
