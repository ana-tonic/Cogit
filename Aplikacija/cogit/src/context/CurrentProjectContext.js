import React, { useState, createContext } from "react";

export const CurrentProjectContext = createContext();

export const CurrentProjectProvider = (props) => {
  const [currentProject, setCurrentProject] = useState({
    name: "ime",
    deadline: "rok",
  });

  return (
    <CurrentProjectContext.Provider value={[currentProject, setCurrentProject]}>
      {props.children}
    </CurrentProjectContext.Provider>
  );
};
