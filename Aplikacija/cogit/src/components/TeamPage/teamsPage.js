import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ListOfTeams from "./listOfTeams";
import { useSocket } from "../../context/SocketProvider";
import CreateTeamForm from "./createTeamForm";
import axios from "axios";
import AdminButton from "./AdminButton";
import Logout from "../Logout";
import { flushSync } from "react-dom";
import link from "../API.js";
import "./style.css";

const TeamsPage = ({
  listTeams,
  active,
  setListTeams,
  userId,
  admin,
  fetchTeams,
}) => {
  const updateTeams = (team) => {
    setListTeams((listTeams) => [...listTeams, team]);
  };

  const [teams, setTeams] = useState(listTeams);
  const [teamsView, setTeamsView] = useState([]);

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

  const inputRef = useRef();
  var timeoutId;
  const searchTeams = (namePart) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const searchedTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(namePart.toLowerCase())
      );
      if (searchedTeams.length === 0) setTeamsView([""]);
      else {
        setTeamsView(searchedTeams);
      }
    }, 1000);
  };

  return (
    <div>
      <div className="headerWrapper">
        <div className="logo">
          <img src="../Screenshot_1.jpg" width="10%" height="27%" alt="" />
          <div className="headerDiv">Cogit</div>
        </div>
        <div className="logbtn">
          <AdminButton admin={admin} />
          <div>
            <Link
              to={`/Activity`}
              className="ui large blue button"
              style={{ height: "40px", position: "relative" }}
            >
              Activity page
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
          </div>
          <div>
            <Link
              to={`/Chat`}
              className="ui large blue button"
              style={{ height: "40px" }}
            >
              Chat
            </Link>
          </div>
          <div>
            <Link
              to={`/Settings`}
              className="ui large blue button"
              style={{ height: "40px" }}
            >
              Settings page
            </Link>
          </div>
          <Logout />
        </div>
      </div>

      <div className="mainContainer">
        {admin === true ? <div className="filler"></div> : ""}
        <div className="adminTeams">
          {admin === true ? (
            <div className="teamBar">
              <div className="ui input">
                <input
                  type="text"
                  ref={inputRef}
                  placeholder="Seacrh teams"
                  onChange={() => {
                    searchTeams(inputRef.current.value);
                  }}
                />
              </div>
            </div>
          ) : (
            ""
          )}
          <ListOfTeams
            teams={teamsView.length === 0 ? teams : teamsView}
            userId={userId}
            admin={admin}
            fetchTeams={fetchTeams}
            searchString={inputRef.current ? inputRef.current.value : ""}
          />
        </div>
        {admin === false ? (
          <CreateTeamForm update={updateTeams} userId={userId} />
        ) : (
          <div className="filler"></div>
        )}
        <div
          className={`ui dimmer ${active}`}
          style={{ backgroundColor: "rgba(0,0,0,.95)" }}
        >
          <div className="ui indeterminate text loader">
            Preparing list of teams
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
