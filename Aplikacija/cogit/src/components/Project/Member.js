import React, { useState, useEffect } from "react";

const Member = ({
  member,
  editors,
  buttonText,
  setButtonText,
  ChangeAssignment,
  disabled,
}) => {
  //console.log(disabled);
  // const [buttonText, setButtonText] = useState("Assign to");
  const [text, setText] = useState("Assign to");
  let indicator = false;

  useEffect(() => {
    editors.map((editor) => {
      if (member.id === editor.id) indicator = true;
      //   console.log(editor.id);
    });
    //console.log(indicator);

    if (indicator === true) {
      setButtonText("Unassign");
      setText("Unassign");
    } else setButtonText("Assign to");
  }, []);

  return (
    <div className="project item" key={member.id}>
      <img
        className="ui avatar image"
        src={`data:image/png;base64,${member.avatar.picture}`}
        alt={member.avatar.name}
      />
      <span style={{ marginLeft: "5px" }}>{member.username}</span>

      <button
        className="ui right floated button"
        onClick={() => {
          ChangeAssignment(member.id);
          if (text === "Unassign") setText("Assign to");
          else setText("Unassign");
        }}
        style={{
          display: `${disabled}`,
          backgroundColor: "rgb(38, 80, 255)",
          color: "white",
        }}
      >
        {text}
      </button>
    </div>
  );
};

export default Member;
