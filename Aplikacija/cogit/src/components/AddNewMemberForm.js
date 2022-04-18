import React, { useState } from "react";

const AddNewMemberForm = (props) => {
  const [details, setDetails] = useState("");

  function addNew() {
    if (details) {
      if (details === "Admin User") return;
      props.AddNewMember(details);
      temp();
    }
  }

  function temp() {
    props.setTrigger(false);
    props.AddMemberBtn("");
    setDetails("");
  }

  return props.trigger ? (
    <div style={{ zIndex: "1" }}>
      <input
        onChange={(e) => {
          setDetails(e.target.value);
        }}
      ></input>
      <button
        className="ui button"
        onClick={addNew}
        style={{ backgroundColor: " #237dc3", color: "white" }}
      >
        Add user via username
      </button>
      <button
        className="ui button"
        onClick={temp}
        style={{ backgroundColor: " #237dc3", color: "white" }}
      >
        Cancel
      </button>
    </div>
  ) : (
    ""
  );
};

export default AddNewMemberForm;
