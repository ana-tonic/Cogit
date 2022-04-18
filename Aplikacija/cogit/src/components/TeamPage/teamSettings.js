import React from "react";
import { useState, useRef } from "react";
import axios from "axios";
import link from "../API.js";

const TeamSettings = (props) => {
  const [name, setName] = useState(props.name);
  const [errorName, setErrorName] = useState(false);
  const inputRef = useRef();

  function deleteTeam(teamId) {
    axios
      .delete(link + "/teams/" + teamId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {})
      .catch((e) => {
        console.log(e);
      });
  }

  function updateTeamName(teamId, newName) {
    axios
      .patch(
        link + "/teams/" + teamId,
        {
          name: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {})
      .catch((e) => {
        console.log(e);
      });
  }

  if (props.leaderFlag || props.admin) {
    return props.trigger ? (
      <div className="popup">
        <div className="setContainer">
          <div className="btn">
            <button
              className="mini ui button"
              onClick={() => {
                props.setTriger(false);
              }}
            >
              Close
            </button>
          </div>
          <label className="labelT">{name}</label>
          <div className="ui input">
            <input
              ref={inputRef}
              type="text"
              onChange={(e) => {
                if (errorName) setErrorName(false);
              }}
            />
          </div>

          {errorName === false ? (
            ""
          ) : (
            <div class="ui warning message">
              <i
                class="close icon"
                onClick={() => {
                  setErrorName(false);
                }}
              ></i>
              <div class="header">You must enter team name!</div>
            </div>
          )}

          <button
            className="ui button"
            onClick={() => {
              if (inputRef.current.value != "") {
                updateTeamName(props.teamId, inputRef.current.value);
                setName(inputRef.current.value);
                props.setNewName(inputRef.current.value);
                inputRef.current.value = "";
              } else {
                setErrorName(true);
              }
            }}
          >
            Change name
          </button>
          <button
            className="ui red button"
            onClick={() => {
              deleteTeam(props.teamId);
              props.setTriger(false);
              props.remove(props.ind);
            }}
          >
            Delete team
          </button>
        </div>
      </div>
    ) : (
      ""
    );
  } else {
    return props.trigger ? (
      <div className="popup">
        <div className="setContainer">
          <div className="btn">
            <button
              className="mini ui button"
              onClick={() => {
                props.setTriger(false);
              }}
            >
              Close
            </button>
          </div>
          <label>{name}</label>
          <button
            className="ui negative basic button"
            onClick={() => {
              props.removeMe(props.id);
              props.setTriger(false);
              props.remove(props.ind);
            }}
          >
            Leave team
          </button>
        </div>
      </div>
    ) : (
      ""
    );
  }
};

export default TeamSettings;

//Dodaj dugme za brisanje kad je vodja tima tu

/*
background-color: darkgray; u team

*/
