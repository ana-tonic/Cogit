import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Visibility } from "semantic-ui-react";
import "./styleN.css";
import link from "../API.js";

const Note = (props) => {
  const [textA, setTextA] = useState(props.text);
  const teamID = useLocation().pathname.split("/")[1];

  var visibilityValue = "visible";
  var visibilityValue2 = "visible";

  if (!props.accessR) {
    visibilityValue = "hidden";
  }

  if (!props.accessR2) {
    visibilityValue2 = "hidden";
  }

  return (
    <div className="noteDiv">
      <div className="btnSave">
        <button
          className="ui primary button"
          style={{ visibility: visibilityValue }}
          onClick={() => {
            if (textA !== "") {
              if (props.id === undefined) props.addNote(textA);
              else props.updateNote(props.id, textA);
            }
          }}
        >
          Save
        </button>
        <button
          className="ui red button"
          style={{ visibility: visibilityValue2 }}
          onClick={() => {
            props.removeMe(props.id);
          }}
        >
          Delete
        </button>
      </div>
      <textarea
        cols="27"
        rows="5"
        className="textAri"
        defaultValue={textA}
        onChange={(e) => {
          setTextA(e.target.value);
        }}
      ></textarea>
    </div>
  );
};

export default Note;
