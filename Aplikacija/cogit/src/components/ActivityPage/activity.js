import React, { useState } from "react";
import avatar from "./avatarexample.png";
import TimeAgo from "react-timeago";

const Activity = (props) => {
  const time = new Date(props.time);
  return (
    <div className="activityD">
      <i className="big bell outline icon"></i>
      <div className="desc">{props.description}</div>
      <TimeAgo date={time} className="time" />
    </div>
  );
};

export default Activity;
