import React from "react";
import TeamMember from "./teamMember";
import { useState } from "react";

const MemberList = (props) => {
  const [renFlag, setRen] = useState(true);
  var teamMembers;
  var counter = 0;

  const removeMember = (ind) => {
    props.teamMembers.splice(ind, 1);
    setRen(!renFlag);
  };

  if (props.teamMembers != null) {
    teamMembers = props.teamMembers.map(({ username, avatar, id }) => {
      return (
        <TeamMember
          fullName={username}
          key={id}
          id={id}
          ind={counter++}
          avatar={avatar}
          removeMe={removeMember}
        ></TeamMember>
      );
    });
  } else {
    teamMembers = null;
  }

  if (teamMembers != null) {
    return <div className="memberList">{teamMembers}</div>;
  } else {
    return <div className="memberList"></div>;
  }
};

export default MemberList;

//key je neka vrsta privatnog atributa, ne mozemo da mu pristupimo!
//on sluzi react-u, a ne nama
