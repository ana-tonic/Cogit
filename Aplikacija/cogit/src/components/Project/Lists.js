import { useState } from "react";
import List from "./List";

const Lists = ({
  //#region props
  lists,
  deleteList,
  setActiveDeleteLoader,
  projectName,
  dueDate,
  teamLeaderDisplay,
  setLists,
  projectID,
  ChangeListFunction,
  fetchTeams,
  //#endregion
}) => {
  // console.log(lists);
  const [state, setState] = useState(0);

  const changeState = () => {
    setState((value) => value + 1);
    console.log(state);
  };

  const renderedOptions = () =>
    lists.map((list) => {
      return (
        <List
          key={list.id}
          name={list.name}
          deleteList={deleteList}
          listId={list.id}
          setActiveDeleteLoader={setActiveDeleteLoader}
          projectName={projectName}
          dueDate={dueDate}
          teamLeaderDisplay={teamLeaderDisplay}
          lists={lists}
          setLists={setLists}
          projectID={projectID}
          ChangeListFunction={ChangeListFunction}
          fetchTeams={fetchTeams}
          changeState={changeState}
          state={state}
        />
      );
    });

  return renderedOptions();
};

export default Lists;
