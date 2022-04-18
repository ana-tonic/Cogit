import React, { useState } from "react";
import "./ProjectSettingsForm.css";
import Dropdown from "./CustomDropDown";
import ModalProjectComponent from "./ModalProjectComponent.js";
import DatePicker from "react-datepicker";

const options = [
  {
    value: "none",
    label: "none",
  },
  {
    value: "important",
    label: "important",
  },
  {
    value: "on hold",
    label: "on hold",
  },
];

const ProjectSettingsForm = ({
  //#region props
  trigger,
  deleteProject,
  changeProjectName,
  changeProjectDeadline,
  changeNameMessageText,
  setErrorVisibility,
  errorVisibility,
  dateErrorVisibility,
  setDateErrorVisibility,
  descriptionErrorVisibility,
  setDescriptionErrorVisibility,
  dueDate,
  changeProjectDescription,
  changeProjectTag,
  //#endregion
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(new Date(dueDate)); // poslednje promenjeno
  const [newMinDate, setNewMinDate] = useState(new Date(dueDate));
  const [selected, setSelected] = useState(options[0]);

  return trigger ? (
    <div className="ProjectSettingsForm">
      <label>Change name</label>
      <div className="ui icon input">
        <input
          type="text"
          placeholder="Enter new name here"
          onChange={(e) => {
            setName(e.target.value);
            setErrorVisibility("hidden");
          }}
          value={name}
          style={{ margin: "5px 5px 0px 5px" }}
        />
        <i
          className="check link icon"
          onClick={() => {
            setName("");
            changeProjectName(name);
          }}
        ></i>
      </div>

      <div className={`ui ${errorVisibility} error message`}>
        <i
          className="close icon"
          onClick={() => setErrorVisibility("hidden")}
        ></i>
        <div className="header"></div>
        {/* <p style={{ marginRight: "5px" }}>{changeNameMessageText}</p> */}
        <p style={{ marginRight: "5px" }}>{changeNameMessageText}</p>
      </div>

      {/* izmena deadline-a */}

      <label style={{ marginTop: "10px", marginBottom: "5px" }}>
        Change deadline
      </label>

      <div className="ChangeDeadline">
        <DatePicker
          selected={deadline}
          onChange={(value) => {
            setNewMinDate(deadline);
            setDeadline(value);
            setDateErrorVisibility("hidden");
          }}
          dateFormat="dd/MM/yyyy"
          minDate={newMinDate}
          isClearable
          showYearDropdown
          scrollableMonthYearDropdown
        />

        <i
          className="check link icon"
          onClick={() => {
            changeProjectDeadline(deadline);
          }}
          style={{ marginLeft: "2px" }}
        ></i>
      </div>

      <div className={`ui ${dateErrorVisibility} error message`}>
        <i
          className="close icon"
          onClick={() => setDateErrorVisibility("hidden")}
        ></i>
        <div className="header"></div>
        {/* <p style={{ marginRight: "5px" }}>{changeNameMessageText}</p> */}
        <p style={{ marginRight: "5px" }}>Deadline is required!</p>
      </div>

      {/* izmena opisa  */}

      <label style={{ marginTop: "5px" }}>Change description</label>
      <div className="ui icon input" style={{ marginBottom: "5px" }}>
        <textarea
          type="text"
          placeholder="Enter new description here"
          onChange={(e) => {
            setDescription(e.target.value);
            setDescriptionErrorVisibility("hidden");
          }}
          value={description}
          style={{ margin: "5px 5px 0px 5px" }}
          rows="5"
        />
        <i
          className="check link icon"
          onClick={() => {
            changeProjectDescription(description);
          }}
        ></i>
      </div>

      <div className={`ui ${descriptionErrorVisibility} error message`}>
        <i
          className="close icon"
          onClick={() => setDescriptionErrorVisibility("hidden")}
        ></i>
        <div className="header"></div>
        {/* <p style={{ marginRight: "5px" }}>{changeNameMessageText}</p> */}
        <p style={{ marginRight: "5px" }}>Max length is 150 charachters.</p>
      </div>

      <ModalProjectComponent
        buttonText={"Delete this project"}
        modalHeader={"Delete this project"}
        modalText={"Are you sure you want to delete this project?"}
        iconClass={"trash alternate icon"}
        confirmFunction={deleteProject}
      />

      {/* izmena taga */}

      <div style={{ display: "flex", flexDirection: "row" }}>
        <Dropdown
          label="Select a tag"
          options={options}
          selected={selected}
          onSelectedChange={setSelected}
        ></Dropdown>

        <i
          style={{ marginTop: "30px" }}
          className="large check link icon"
          onClick={() => {
            changeProjectTag(selected.value);
          }}
        ></i>
      </div>
    </div>
  ) : (
    ""
  );
};

export default ProjectSettingsForm;
