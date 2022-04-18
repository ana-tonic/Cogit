import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./MiniTask.css";
import ModalTask from "./ModalTask";
import { UserContext } from "../../context/UserContext.js";
import link from "../API";

const MiniTask = ({
  //#region props

  task,
  listName,
  projectName,
  deleteTask,
  archiveTask,
  projetDueDate,
  teamLeaderDisplay,
  lists,
  setLists,
  projectID,
  fetchLists,
  ChangeListFunction,
  fetchTeams,
  changeState,
  listId,
  //#endregion
}) => {
  //#region states
  const [userInfo, setUserInfo] = useContext(UserContext);
  const [display, setDisplay] = useState("");
  const [exclamationMarkDisplay, setExclamationMarkDisplay] = useState("");
  const [red, setRed] = useState("");
  const [black, setBlack] = useState("grey");
  const [usersPriority, setUsersPriority] = useState(task.usersPriority);
  const [name, setName] = useState(task.name);
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [description, setDescription] = useState(task.description);
  const [deadline, setDeadline] = useState(task.deadline);
  const [isTeamPriority, setIsTeamPriority] = useState(task.isTeamPriority);
  const [taskDisplay, setTaskDisplay] = useState("");
  const history = useHistory();

  //#endregion
  useEffect(() => {
    if (task.isCompleted === true) setRed("green");
    else if (task.isTeamPriority === true) setRed("red");
    //console.log(task);
    //console.log(display);
  }, []);

  useEffect(() => {
    if (usersPriority === true) setBlack("black");
  }, [usersPriority]);

  useEffect(() => {
    //console.log(userInfo.id);
    if (userInfo.id === undefined || userInfo.id === "") {
      //console.log("Postavljanje");
      axios
        .get(link + "/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {
          setUserInfo({
            id: value.data._id,
            admin: value.data.role === "admin" ? true : false,
            email: value.data.email,
            username: value.data.username,
            avatar: value.data.avatar.name,
            avatarSrc: `data:image/png;base64,${value.data.avatar.picture}`,
          });
        })
        .catch((error) => {
          localStorage.removeItem("token");
          window.location.reload(false);
        })
        .finally((a) => {});
    }

    if (userInfo.id !== "") {
      let i = false;
      let exMark = false;

      task.editors.map((editor) => {
        //console.log(editor);
        if (editor.id === userInfo.id) {
          i = true;
          exMark = true;
        }
      });
      if (teamLeaderDisplay === "") i = true;

      if (i === true) setDisplay("");
      else setDisplay("none");

      if (exMark === true) setExclamationMarkDisplay("");
      else setExclamationMarkDisplay("none");
    }
  }, [userInfo, setUserInfo, task.editors, teamLeaderDisplay]);

  const setCompleted = (completed) => {
    setIsCompleted(completed);

    //console.log(task.isTeamPriority);
    if (completed === true) setRed("green");
    else if (isTeamPriority === true) setRed("red");
    else setRed("");
  };

  const changeDisplay = () => {
    // console.log("ChangeDisplay called");
    if (display === "") setDisplay("none");
    else setDisplay("");
  };

  const setTeamPriority = (priority, completed) => {
    setIsTeamPriority(priority);
    setIsCompleted(completed);

    if (completed) setRed("green");
    else if (priority) setRed("red");
    else setRed("");

    axios
      .patch(
        link + "/tasks/" + task.id + "/team-priority",
        {
          isTeamPriority: priority,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        console.log("Set team priority");
        console.log(response);
        //console.log(task.id);
      })
      .catch(function (error) {
        console.log(error.response.data.error);
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }
        // ako task ne postoji
        else if (error.response.status === 404) {
          setTaskDisplay("none");
          //ako prijavljeni user nije team leader
        } else if (error.response.status === 403) {
          // setDisplay("none");
          window.location.reload(false);
        }
      });
    // });
  };

  const setImportance = () => {
    // {url}/task/:taskId/me/priority
    //console.log(task.id);
    if (black === "black") {
      setBlack("grey");
    } else {
      setBlack("black");
    }
    axios
      .patch(
        link + "/tasks/" + task.id + "/me/priority",
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
        // console.log(error.response.data.error);
        // console.log(error.response.status);

        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }

        // ako task ne postoji
        else if (error.response.status === 404) {
          setTaskDisplay("none");
        } else if (error.response.status === 403) {
          // ako je korisnik izbacen iz tima
          if (
            error.response.data.error ===
            "Not authorized.  To access this document you need to be team member."
          ) {
            history.push("/");
            fetchTeams();
          }

          //ako prijavljenom useru nije dodeljen zadatak
          setExclamationMarkDisplay("none");
        }
      });
  };

  //console.log(task);
  return (
    <div
      className={`MiniTaskContainer ${red}`}
      style={{ display: `${taskDisplay}` }}
    >
      {/* <div className="MiniTaskContainer"> */}
      <h4 className="ui header MiniTask">
        {name}
        <div className="sub header">{task.dueDate}</div>
      </h4>

      <div className="MiniTask icons">
        <ModalTask
          projectName={projectName}
          listName={listName}
          deleteTask={deleteTask}
          archiveTask={archiveTask}
          id={task.id}
          projetDueDate={projetDueDate}
          name={name}
          setName={setName}
          isCompleted={isCompleted}
          setIsCompleted={setCompleted}
          deadline={deadline}
          des={description}
          teamLeaderDisplay={teamLeaderDisplay}
          isTeamPriority={isTeamPriority}
          setIsTeamPriority={setTeamPriority}
          setTaskDisplay={setTaskDisplay}
          lists={lists}
          setLists={setLists}
          projectID={projectID}
          fetchLists={fetchLists}
          ChangeListFunction={ChangeListFunction}
          display={display}
          changeDisplay={changeDisplay}
          fetchTeams={fetchTeams}
          changeState={changeState}
          listId={listId}
        />
        {/* <i className="plus icon"></i> */}
        <i
          className={`exclamation ${black} icon`}
          onClick={() => setImportance()}
          style={{ display: `${exclamationMarkDisplay}` }}
        ></i>
      </div>
    </div>
  );
};

export default MiniTask;
