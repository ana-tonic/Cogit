import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import EditorsList from "../MyTasks/EditorsList.js";
import axios from "axios";
import ListsLoader from "../Project/ListsLoader";
import OptionsList from "./OptionsList.js";
import MembersList from "./MembersList.js";

const EditTask = ({
  //#region props
  ChangeAssignment,
  name,
  setName,
  isCompleted,
  setIsCompleted,
  description,
  setDescription,
  deadline,
  setDeadline,
  editors,
  projetDueDate,
  isTeamPriority,
  setIsTeamPriority,
  members,
  disabled,
  //#endregion
}) => {
  //#region
  // const [Sname, setName] = useState(name);
  // const [Sdescription, setDescription] = useState(description);
  // const [Sdeadline, setDeadline] = useState(new Date(deadline)); // poslednje promenjeno
  //console.log("deadline: " + deadline);
  // console.log("projectDueDate " + projetDueDate);
  // console.log(new Date(deadline));
  //console.log(task);
  //console.log(description);
  //console.log(editors);
  //#endregion

  const [newMinDate, setNewMinDate] = useState(new Date());
  const [buttonText, setButtonText] = useState("Assign to");

  return (
    <div className="ui segment">
      <div className="ui grid">
        <div className="left floated nine wide column">
          <label style={{ marginBottom: "10px" }}>Edit task name:</label>
          <div className="ui input" style={{ marginTop: "5px" }}>
            <input
              type="text"
              onChange={(e) => {
                setName(e.target.value);
                //setErrorMessageVisibility("hidden");
              }}
              value={name}
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <label style={{ marginBottom: "5px" }}>Edit deadline:</label>
            <DatePicker
              selected={new Date(deadline)}
              onChange={(value) => {
                setDeadline(value);
              }}
              dateFormat="dd/MM/yyyy"
              minDate={newMinDate}
              maxDate={new Date(projetDueDate)}
              isClearable
              showYearDropdown
              scrollableMonthYearDropdown
            />
          </div>
        </div>
      </div>

      <div className="ui form" style={{ marginTop: "10px" }}>
        {/* <div className="field"> */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px" }}>Edit description:</label>

          <div className="ui input">
            <input
              type="text"
              onChange={(e) => {
                setDescription(e.target.value);
                //setErrorMessageVisibility("hidden");
              }}
              value={description}
            />
          </div>
        </div>

        <div className="form-group">
          <div style={{ margin: "10px 0px" }} className="ui checkbox">
            <input
              id="example-id"
              type="checkbox"
              name="example"
              onChange={() => setIsTeamPriority(!isTeamPriority)}
              checked={isTeamPriority}
            />
            <label htmlFor="example-id" style={{ cursor: "pointer" }}>
              Mark as an important task
            </label>
          </div>
        </div>

        <div className="form-group">
          <div style={{ margin: "10px 0px" }} className="ui checkbox">
            <input
              id="completed"
              type="checkbox"
              name="example"
              onChange={() => setIsCompleted(!isCompleted)}
              checked={isCompleted}
            />
            <label htmlFor="completed" style={{ cursor: "pointer" }}>
              Mark as completed
            </label>
          </div>
        </div>

        <p>{/* <i className="user icon"></i>Assigned to */}</p>
        <div className="ui segment">
          <div className="ui large list">
            <MembersList
              members={members}
              editors={editors}
              buttonText={buttonText}
              setButtonText={setButtonText}
              ChangeAssignment={ChangeAssignment}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* <div className="ui segment">
        <OptionsList options={options} />
      </div> */}
    </div>
  );
};
export default EditTask;
