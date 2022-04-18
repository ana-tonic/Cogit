import React, { useState } from "react";

const AddNewBoardComponent = (props) => {
  const [name, setName] = useState("");

  const Check = () => {
    if (name === "") {
      props.setErrorMessage("visible");
      props.setErrorText("List name required!");
      return;
    }

    props.AddNewBoard(name);
    setName("");
  };

  const Close = () => {
    props.setTrigger(false);
    props.setAddNewBoardBtn("");
  };

  return props.trigger ? (
    <div>
      <div className="ui input">
        <input
          type="text"
          placeholder="Enter board name"
          onChange={(e) => {
            setName(e.target.value);
            props.setErrorMessage("hidden");
          }}
          value={name}
        />

        <button
          className="ui icon button"
          onClick={Check}
          style={{ backgroundColor: " rgba(107, 185, 248, 0.801)" }}
        >
          <i className={`${props.iconClass}`}></i>
        </button>

        <button
          className="ui icon button"
          onClick={Close}
          style={{ backgroundColor: " rgba(107, 185, 248, 0.801)" }}
        >
          <i className="close icon"></i>
        </button>
      </div>

      <div
        className={`ui ${props.errorMessage} error message`}
        style={{
          marginBottom: "15px",
          marginTop: "3px",
          padding: "0.5em",
        }}
      >
        <div className="header"></div>
        <p>{props.errorText}</p>
      </div>
    </div>
  ) : (
    ""
  );
};

export default AddNewBoardComponent;
