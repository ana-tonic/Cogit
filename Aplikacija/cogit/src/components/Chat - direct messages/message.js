import React from "react";
import TimeAgo from "react-timeago";

const Message = (props) => {
  const findWidth = () => {
    const w = props.text.length * 17;
    if (w > 180) {
      return 180;
    } else {
      return w;
    }
  };

  const w = findWidth() + "px";
  const time = new Date(props.time);

  if (props.dirFlag === true) {
    return (
      <div className="messageWrap">
        <TimeAgo date={time} />
        <div className="message messageO" style={{}}>
          {props.text}
        </div>
      </div>
    );
  } else {
    return (
      <div className="messageWrap2">
        <TimeAgo date={time} />
        <div className="message messageD" style={{}}>
          {props.text}
        </div>
      </div>
    );
  }
};

export default Message;
