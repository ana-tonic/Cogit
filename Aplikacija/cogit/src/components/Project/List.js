import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import TasksList from "./TasksList";
import "./List.css";
import NewTaskForm from "./NewTaskForm";
import ListsLoader from "../Project/ListsLoader";
import link from "../API";

const List = ({
  //#region props
  changeState,
  name,
  deleteList,
  listId,
  setActiveDeleteLoader,
  projectName,
  dueDate,
  teamLeaderDisplay,
  lists,
  setLists,
  projectID,
  ChangeListFunction,
  fetchTeams,
  state,
  //#endregion
}) => {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [active, setActive] = useState(true); //Loader for fetching the first time
  const [display, setDisplay] = useState("none"); // for exclamation mark visibility
  const history = useHistory();
  const _isMounted = useRef(true);

  useEffect(() => {
    axios
      .get(
        link + "/tasks/lists/" + listId,
        // +
        // "?isArchived=false"
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        // if (_isMounted.current) {
        setTasks(response.data);
        setActive(false);
        //console.log(response.data);
        // }
      })
      .catch(function (error) {
        if (error.response) {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }
          // nije clan tima
          else if (error.response.status === 403) {
            history.push("/");
            fetchTeams();
          }

          //lista nije nadjena
          else if (error.response.status === 404) {
            // onda valjda samo nece da se ucita ako nije nadjena
          }
        }
      });

    return () => {
      _isMounted.current = false;
    };
  }, [state]);

  // pribavljanje taskova unutar jedne liste
  function fetchTasks() {
    //console.log("Pribavljanje taskova liste: " + listId);
    axios
      .get(
        link + "/tasks/lists/" + listId,
        // +
        // "?isArchived=false"
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        setTasks(response.data);
        setActive(false);
        //console.log(response.data);
      })
      .catch(function (error) {
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }

        // nije clan tima
        else if (error.response.status === 403) {
          history.push("/");
          fetchTeams();
        }

        //lista nije nadjena
        else if (error.response.status === 404) {
          // onda valjda samo nece da se ucita ako nije nadjena
        }
      });
  }

  // brisanje taska
  function deleteTask(taskId) {
    setTasks(tasks.filter((task) => task.id !== taskId));

    axios
      .delete(link + "/tasks/" + taskId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        // setActive(false);
      })
      .catch(function (error) {
        console.log(error.response.data.error);
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }

        // ukoliko task ne postoji
        else if (error.response.status === 404) {
          // zatvoriti modal komponentu
          fetchTasks();
        }

        // ukoliko prijavljeni user nije team memeber
        else if (error.response.status === 403) {
          history.push("/");
          fetchTeams();
        }
      });
  }

  function isArchived(task) {
    if (task.isArchived == true) return false;
    else return true;
  }

  // arhiviranje taska
  function archiveTask(taskId) {
    // arhiviraj lokalno
    tasks.map((task) => {
      if (task.id === taskId) task.isArchived = true;
    });

    axios
      .patch(
        link + "/tasks/" + taskId,
        {
          isArchived: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        console.log(response);
        console.log("arhiviranje taska");
        const newTasks = tasks.filter(isArchived);
        console.log(newTasks);
        setTasks(newTasks);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  if (active) return <ListsLoader active={active} height="150px" />;
  else if (showForm)
    return (
      <div className="List">
        <Header showForm={showForm} setShowForm={setShowForm} name={name} />
        <NewTaskForm
          trigger={showForm}
          setTrigger={setShowForm}
          listId={listId}
          setTasks={setTasks}
          dueDate={dueDate}
          display={display}
          setDisplay={setDisplay}
          fetchTeams={fetchTeams}
        />
      </div>
    );
  else
    return (
      <div className="List">
        <Header
          showForm={showForm}
          setShowForm={setShowForm}
          name={name}
          deleteList={deleteList}
          listId={listId}
          setActiveDeleteLoader={setActiveDeleteLoader}
        />
        <TasksList
          archiveTask={archiveTask}
          changeState={changeState}
          ChangeListFunction={ChangeListFunction}
          deleteTask={deleteTask}
          dueDate={dueDate}
          display={display}
          listId={listId}
          listName={name}
          lists={lists}
          projectName={projectName}
          projectID={projectID}
          teamLeaderDisplay={teamLeaderDisplay}
          setDisplay={setDisplay}
          setLists={setLists}
          tasks={tasks}
          fetchTeams={fetchTeams}
        />
      </div>
    );
};

export default List;
