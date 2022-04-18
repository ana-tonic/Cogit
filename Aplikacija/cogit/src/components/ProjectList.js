import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Popup } from "semantic-ui-react";

import { CurrentProjectContext } from "../context/CurrentProjectContext";
import "../style/ProjectList.css";

const Projectist = ({ currentTeam, projects }) => {
  const [currentProject, setCurrentProject] = useContext(CurrentProjectContext);
  //console.log(currentProject);

  const renderedProjects = projects.map((project) => {
    return (
      <Link to={`/${currentTeam}/${project.id}`} key={project.id}>
        <div
          className="project item"
          onClick={() => {
            setCurrentProject({
              name: project.name,
              deadline: project.deadline,
            });
            // console.log("name: " + currentProject.name);
            // console.log("deadline: " + currentProject.deadline);
            //console.log(currentProject);
            //console.log(project);
          }}
        >
          {`${project.name}`}

          <Popup
            size="small"
            position="right center"
            trigger={<i className="question circle outline icon"></i>}
            content={`${project.description}`}
            style={{ height: "min-content" }}
          />
        </div>
      </Link>
    );
  });

  return renderedProjects;
};

export default Projectist;
