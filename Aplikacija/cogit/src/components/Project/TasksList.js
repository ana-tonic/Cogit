import React from "react";
import MiniTask from "./MiniTask";

const TasksList = ({
  //#region props
  changeState,
  display,
  tasks,
  listName,
  projectName,
  deleteTask,
  archiveTask,
  dueDate,
  teamLeaderDisplay,
  setDisplay,
  lists,
  listId,
  setLists,
  projectID,
  fetchLists,
  ChangeListFunction,
  fetchTeams,
  //#endregion
}) => {
  const renderedOptions = () =>
    tasks.map((task) => {
      return (
        <MiniTask
          display={display}
          key={task.id}
          task={task}
          listName={listName}
          projectName={projectName}
          deleteTask={deleteTask}
          archiveTask={archiveTask}
          projetDueDate={dueDate}
          teamLeaderDisplay={teamLeaderDisplay}
          setDisplay={setDisplay}
          lists={lists}
          listId={listId}
          setLists={setLists}
          projectID={projectID}
          fetchLists={fetchLists}
          ChangeListFunction={ChangeListFunction}
          fetchTeams={fetchTeams}
          changeState={changeState}
        />
      );
    });

  return renderedOptions();
};

export default TasksList;
