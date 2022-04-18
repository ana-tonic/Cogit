import React, { useState } from "react";
import axios from "axios";
import Team from "./team";
import link from "../API";

const ListOfTeams = ({
  teams,
  setTeams,
  userId,
  admin,
  fetchTeams,
  searchString,
  len,
}) => {
  var counter = 0;
  const [rendFlag, setRendFlag] = useState(false);

  const remove = (ind) => {
    teams.splice(ind, 1);
    setRendFlag(!rendFlag);
  };

  const removeTeam = (ind) => {
    axios
      .patch(
        link + "/users/me/leave/teams/" + ind,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((value) => {
        //setTeams(value);
      })
      .catch((error) => {
        alert(error);
      })
      .finally((a) => {});
  };
  if (teams) {
    const listOfTeams = teams.map(({ name, id, leaderId, _id }, index) => {
      if (id) {
        return (
          <Team
            teamName={name}
            key={id}
            ind={counter++}
            id={id}
            leaderId={leaderId}
            userId={userId}
            remove={remove}
            admin={admin}
            removeMe={() => {
              removeTeam(id);
            }}
          ></Team>
        );
      } else {
        if (_id) {
          return (
            <Team
              teamName={name}
              key={_id}
              ind={counter++}
              id={_id}
              leaderId={leaderId}
              userId={userId}
              remove={remove}
              admin={admin}
              removeMe={() => {
                removeTeam(id);
              }}
            ></Team>
          );
        } else return <div key={index}></div>;
      }
    });

    return <div className="teamList">{listOfTeams}</div>;
  } else return <div></div>;
};

export default ListOfTeams;
