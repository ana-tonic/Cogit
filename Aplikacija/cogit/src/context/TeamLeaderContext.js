import React, { useState, createContext } from "react";

export const TeamLeaderContext = createContext();

export const TeamLeaderProvider = (props) => {
  const [user, setUser] = useState({
    team: "",
    teamLeader: "",
  });

  return (
    <TeamLeaderContext.Provider value={[user, setUser]}>
      {props.children}
    </TeamLeaderContext.Provider>
  );
};
