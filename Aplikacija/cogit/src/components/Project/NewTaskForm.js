import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import "./NewTaskForm.css";
import DatePckr from "../DatePicker";
import OptionsList from "./OptionsList";
import link from "../API";

const NewTaskForm = ({
  trigger,
  setTrigger,
  listId,
  setTasks,
  dueDate,
  display,
  setDisplay,
  fetchTeams,
}) => {
  //#region states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dueDateBorder, setDueDateBorder] = useState("grey");
  const [errorMessageText, setErrorMessageText] = useState("");
  const [errorMessageVisibility, setErrorMessageVisibility] =
    useState("hidden");
  const currTeam = useLocation().pathname.split("/")[1];
  // let users = [];
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [options, setOptions] = useState([]);
  const [important, setImportant] = useState(false);
  const [pointerEvents, setPointerEvents] = useState("");
  const history = useHistory();
  //#endregion

  useEffect(() => {
    fetchMe();
  }, []);

  function fetchMe() {
    axios
      .get(link + "/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        //console.log(response.data);
        fetchMembers(response.data.id);
      })
      .catch((error) => {
        console.log(error);
        localStorage.removeItem("token");
        window.location.reload(false);
      })
      .finally((a) => {});
  }

  function fetchMembers(leaderId) {
    axios
      .get(link + "/teams/" + currTeam + "/members", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        response.data.map((user) => {
          if (leaderId !== user._id) {
            setOptions((prevState) => [
              {
                key: user.username,
                text: user.username,
                value: user._id,
                selected: false,
              },
              ...prevState,
            ]);
          }
        });
      })
      .catch((error) => {
        console.log(error);
        console.log(currTeam);
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        } else if (
          error.response.status === 404 ||
          error.response.status === 403
        ) {
          history.push("/");
          fetchTeams();
        } else console.log(error);
      });
  }

  function createNewTask() {
    setPointerEvents("none");
    axios
      .post(
        link + "/tasks/lists/" + listId,
        {
          name: name,
          description: description,
          deadline: deadline,
          isTeamPriority: important,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        //console.log(response.data);
        //console.log(response.data.id);

        options.map((option) => {
          if (option.selected) {
            // console.log("taskId: " + response.data.id);
            // console.log("userId: " + option.value);
            assignTask(response.data.id, option.value);
          }
        });
        setTasks((prevState) => [response.data, ...prevState]);
        setTrigger(false);
        setDisplay("");
        setPointerEvents("");
      })
      .catch(function (error) {
        setErrorMessageVisibility("visible");
        setErrorMessageText(error.response.data.error);

        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }
        // ukoliko projekat ne postoji
        else if (error.response.status === 404) {
          // ovo ne bi trebalo nikad da se desi
          history.push("/");
          fetchTeams();
        }
        // ukoliko prijavljeni user nije team leader
        else if (error.response.status === 403) {
          window.location.reload(false);
        }
      });
  }

  function assignTask(taskId, userId) {
    axios
      .patch(
        link + "/tasks/" + taskId + "/users/" + userId,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error.response.data.error);
        // (404) ako se task ne kreira nece ni da se pozove ova funkcija
        // (403) ako prijavljeni user nije team leader
        if (error.response.status === 403) window.location.reload(false);
      });
  }

  // uzima vrednosti iz Dropdown komponente
  const handleChange = (e, { value }) => {
    // users = value;
    // setAssignedTo(e.target.value);
    // setDropDownValue((prevState) => [...prevState, value]);
    // { values: [ {value, text, name} ] }
    // this.setState({ [key]: value });
    //setDropDownValue();

    setSelectedUsers(value);
    console.log(value);
  };

  const submitHandler = () => {
    // if (details.name === "") {
    //   setErrorMessageVisibility("visible");
    //   setErrorMessageText("Task name is required!");
    //   return;
    // }

    createNewTask();
  };

  return trigger ? (
    <div className="NewTaskForm semantic ui">
      <div className="NewTaskFormLeft">
        <label>Enter task name:</label>
        <div className="ui input">
          <input
            type="text"
            onChange={(e) => {
              setName(e.target.value);
              setErrorMessageVisibility("hidden");
            }}
          />
        </div>

        <label>Choose due date:</label>

        <DatePckr
          selectedDate={deadline}
          setDueDate={setDeadline}
          dueDateBorder={dueDateBorder}
          setDueDateBorder={setDueDateBorder}
          maxDate={dueDate}
          setErrorMessageVisibility={setErrorMessageVisibility}
        />

        <label>Enter description: </label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          style={{ resize: "none" }}
        ></textarea>

        <div className="form-group">
          <div style={{ margin: "10px 0px" }} className="ui checkbox">
            <input
              id="example-id"
              type="checkbox"
              name="example"
              onChange={() => setImportant(!important)}
            />
            <label htmlFor="example-id" style={{ cursor: "pointer" }}>
              Mark as an important task
            </label>
          </div>
        </div>
      </div>

      <div className="NewTaskFormRight">
        <label>Assign to</label>

        <div className="ui segment">
          <OptionsList options={options} setOptions={setOptions} />
        </div>

        <div
          className={`ui ${errorMessageVisibility} error message`}
          style={{
            fontSize: "small",
            margin: "10px",
            padding: "0.5em",
            boxShadow:
              "0 2px 4px 0 rgba(221, 106, 106, 0.918), 0 2px 4px 0 rgba(221, 106, 106, 0.918)",
          }}
        >
          <div className="header"></div>
          <p>{`${errorMessageText}`}</p>
        </div>

        <button
          className="ui button"
          onClick={submitHandler}
          style={{ pointerEvents: `${pointerEvents}` }}
        >
          Save
        </button>
      </div>
    </div>
  ) : (
    ""
  );
};

export default NewTaskForm;
