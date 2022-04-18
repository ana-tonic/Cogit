import React from "react";
import { Route } from "react-router-dom";
import Project from "../components/Project/Project.js";

const ProjectsRoutes = ({ teamID, projects, fetchTeams, teamName }) => {
  const projectRoute = projects.map((project) => {
    const projectPage = () => {
      return (
        <div style={{ flexGrow: 1 }}>
          {/* <CurrentProjectProvider> */}
          {/* <TeamLeaderProvider> */}
          <Project
            project={project}
            fetchTeams={fetchTeams}
            teamName={teamName}
          />
          {/* </TeamLeaderProvider> */}
          {/* </CurrentProjectProvider> */}
        </div>
      );
    };

    return (
      <Route
        key={project.id}
        path={`/${teamID}/${project.id}`}
        exact
        component={projectPage}
      />
    );
  });

  return projectRoute;
};

export default ProjectsRoutes;

// <Route path="/Project1" component={Project1} />
