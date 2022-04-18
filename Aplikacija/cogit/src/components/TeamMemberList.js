import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import TeamMember from "./TeamMember";
import { UserContext } from "../context/UserContext";
import link from "./API";
import axios from "axios";

const TeamMemberList = ({
  members,
  getMembers,
  display,
  fetchTeams,
  setMembers,
}) => {
  const [user, setUser] = useContext(UserContext);
  const [loadUser, setLoadUser] = useState(true);
  const [me, setMe] = useState({ id: 0, leader: false });
  const [lock, setLock] = useState(true);
  const [buttonLock, setButtonLock] = useState(true);
  const history = useHistory();

  //console.log(user);

  if (loadUser) {
    if (user.id === "") {
      //console.log("load");
      axios
        .get(link + "/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {
          setUser({
            token: localStorage.getItem("token"),
            email: value.data.email,
            username: value.data.username,
            notificationNumber: value.data.notificationNumber,
            avatar: value.data.avatar.name,
            avatarSrc: `data:image/png;base64,${value.data.avatar.picture}`,
            id: value.data.id,
            admin: value.data.role === "admin" ? true : false,
          });
        })
        .catch((error) => {
          console.log(error);
          if (error.response) {
            // ukoliko korisnik nije pronadjen
            if (error.response.status === 470) {
              localStorage.removeItem("token");
              window.location.reload(false);
            }

            // ukoliko prijavljeni user nije team memeber
            else if (error.response.status === 403) {
              console.log("fetchProjects - nije team member");
              history.push("/");
              fetchTeams();
            }

            // ukoliko je tim obrisan
            else if (error.response.status === 404) {
              //alert(error.response.data.error);
              history.push("/");
              fetchTeams();
            }
          }
        })
        .finally((a) => {});
      setLoadUser(false);
    }
  }
  //console.log(members[0], user, loadUser);
  if (members[0] !== "")
    if (user.id !== "") {
      if (lock) {
        for (const member of members) {
          if (user.id === member.id && member.role === "leader") {
            setMe({ id: user.id, leader: true });
          }
        }

        setLock(false);
      }
    }

  const mem = members.map((value, index) => {
    if (value.avatar) {
      return (
        <TeamMember
          members={members}
          setMembers={setMembers}
          admin={user.admin}
          buttonLock={buttonLock}
          setButtonLock={setButtonLock}
          me={me}
          id={value.id}
          name={value.username}
          key={index}
          role={value.role === "leader" ? "Team leader" : "Team member"}
          avatar={value.avatar}
          getMembers={getMembers}
          display={display}
          fetchTeams={fetchTeams}
          user={user}
        />
      );
    } else return <div key={index}></div>;
  });

  return mem;
};

export default TeamMemberList;
