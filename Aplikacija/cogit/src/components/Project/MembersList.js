import React, { useState } from "react";
import "./MembersList.css";
import Member from "./Member";

const MembersList = ({
  members,
  editors,
  buttonText,
  setButtonText,
  ChangeAssignment,
  disabled,
}) => {
  //   const [buttonText, setButtonText] = useState("Assign to");
  let indicator;

  if (members && editors) {
    // console.log("Members: " + members);
    // console.log(members);
    // console.log("Editors: ");
    // console.log(editors);
    const membersList = members.map((member) => {
      return (
        <Member
          member={member}
          editors={editors}
          key={member.id}
          buttonText={buttonText}
          setButtonText={setButtonText}
          ChangeAssignment={ChangeAssignment}
          disabled={disabled}
        />
      );
    });
    return membersList;
  } else return <div></div>;
};

export default MembersList;
