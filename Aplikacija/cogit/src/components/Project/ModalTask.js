import React from "react";
import { Button, Modal } from "semantic-ui-react";
import MyTask from "../MyTasks/MyTask.js";

function exampleReducer(state, action) {
  switch (action.type) {
    case "close":
      return { open: false };
    case "open":
      return { open: true };
    default:
      throw new Error("Unsupported action...");
  }
}

const ModalTask = ({
  //#region  props
  projectName,
  listName,
  id,
  deleteTask,
  archiveTask,
  projetDueDate,
  name,
  deadline,
  des,
  setName,
  teamLeaderDisplay,
  isTeamPriority,
  setIsTeamPriority,
  isCompleted,
  setIsCompleted,
  setTaskDisplay,
  lists,
  setLists,
  projectID,
  fetchLists,
  ChangeListFunction,
  display,
  changeDisplay,
  fetchTeams,
  changeState,
  listId,
  //#endregion
}) => {
  const [state, dispatch] = React.useReducer(exampleReducer, { open: false });

  return (
    <>
      <i
        className="eye icon"
        onClick={() => dispatch({ type: "open" })}
        style={{ margin: "5px", right: 0 }}
      ></i>

      <Modal
        size={"tiny"}
        open={state.open}
        onClose={() => dispatch({ type: "close" })}
      >
        <Modal.Content scrolling>
          <MyTask
            projectName={projectName}
            listName={listName}
            id={id}
            deleteTask={deleteTask}
            archiveTask={archiveTask}
            projetDueDate={projetDueDate}
            name={name}
            deadline={deadline}
            des={des}
            setName={setName}
            teamLeaderDisplay={teamLeaderDisplay}
            isTeamPriority={isTeamPriority}
            setIsTeamPriority={setIsTeamPriority}
            isCompleted={isCompleted}
            setIsCompleted={setIsCompleted}
            dispatch={dispatch}
            setTaskDisplay={setTaskDisplay}
            lists={lists}
            setLists={setLists}
            projectID={projectID}
            fetchLists={fetchLists}
            ChangeListFunction={ChangeListFunction}
            display={display}
            changeDisplay={changeDisplay}
            fetchTeams={fetchTeams}
            closeTask={dispatch}
            changeState={changeState}
            listId={listId}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button positive onClick={() => dispatch({ type: "close" })}>
            Ok
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default ModalTask;
