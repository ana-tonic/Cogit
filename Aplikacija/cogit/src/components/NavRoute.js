import React from "react";
import { Route } from "react-router-dom";
import Nav from "./Nav";
import { UserProvider } from "../context/UserContext";

const NavRoute = ({ listTeams, currTeam, fetchTeams }) => {
  //console.log("NavPoute", )
  const TeamRutes = listTeams.map((value, index) => {
    if (value._id)
      return (
        <Route key={index} path={`/${value._id}`}>
          {/* <TeamLeaderProvider> */}
          <UserProvider>
            <Nav currTeam={currTeam} fetchTeams={fetchTeams} />
          </UserProvider>
          {/* </TeamLeaderProvider> */}
        </Route>
      );
    else return <div key={index}></div>;
  });
  return <div className="Lower">{TeamRutes}</div>;
};

export default NavRoute;
