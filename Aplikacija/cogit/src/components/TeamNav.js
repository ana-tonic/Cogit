import React, { useContext } from "react";
import { Route } from "react-router-dom";
import TeamComponents from "./TeamComponents";
import { ProjectContext } from "../context/ProjectContext.js";

const TeamNav = ({ listTeams, fetchTeams }) => {
  const [projects, setProjects] = useContext(ProjectContext);
  const TeamRutes = listTeams.map((value, index) => {
    if (value._id) {
      // console.log(value);
      return (
        <Route key={index} path={`/${value._id}`}>
          <TeamComponents
            teamID={value._id}
            teamName={value.name}
            projects={projects}
            fetchTeams={fetchTeams}
          />
        </Route>
      );
    } else return <div key={index}></div>;
  });
  return <div className="Lower">{TeamRutes}</div>;
};

export default TeamNav;
