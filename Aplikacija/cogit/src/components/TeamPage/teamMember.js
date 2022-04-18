import React, { useState } from "react";
import Team from "./team";
import avatar from "./avatarexample.png";

const TeamMember = (props) => {
  const avatarSrc = `data:image/png;base64,${props.avatar.picture}`;

  return (
    <div className="teamMember">
      <img className="ui mini image" src={avatarSrc} alt={props.avatar.name} />
      <label className="labelT">{props.fullName}</label>
      <i
        className="big red minus circle icon"
        onClick={() => {
          props.removeMe(props.ind);
        }}
      ></i>
    </div>
  );
};

export default TeamMember;

//fullname je username
