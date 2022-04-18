import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Dropdown from "./CustomDropDown";
import "./Project.css";
import AddNewBoardComponent from "./AddNewBoard";
import ProjectSettingsForm from "./ProjectSettingsForm";
import Lists from "./Lists";
import ListsLoader from "./ListsLoader";
import { ProjectContext } from "../../context/ProjectContext.js";
import { TeamLeaderContext } from "../../context/TeamLeaderContext";
import link from "../API";

const options = [
  {
    label: "Board view",
    value: "board",
  },
  {
    label: "List view",
    value: "list",
  },
];

const Project = ({ fetchTeams, project, teamName }) => {
  //#region states
  const [projects, setProjects] = useContext(ProjectContext);
  // const [currentProject, setCurrentProject] = useContext(CurrentProjectContext);
  const [user, setUser] = useContext(TeamLeaderContext);
  const [addNewBoardState, setAddNewBoardState] = useState(false);
  const [addNewBoardBtn, setAddNewBoardBtn] = useState("");
  const [addProjectSettingsForm, setAddProjectSettingsForm] = useState(false);
  const [lists, setLists] = useState([]);
  const [active, setActive] = useState(true); //Loader for fetching the first time
  const [iconClass, setIconClass] = useState("check icon"); // Check or loader icon for adding new list
  const [errorMessage, setErrorMessage] = useState("hidden"); // When adding new board
  const [errorText, setErrorText] = useState("List name required!"); // When adding new board
  const [changeNameMessageText, setChangeNameMessageText] = useState(
    "Project name changed successfully"
  ); // Changing project name
  const [errorVisibility, setErrorVisibility] = useState("hidden"); // When changing project name;
  const [dateErrorVisibility, setDateErrorVisibility] = useState("hidden"); // When changing project duedate;
  const [descriptionErrorVisibility, setDescriptionErrorVisibility] =
    useState("hidden"); // When changing project desription;
  const [formatedDate, setFormatedDate] = useState("");
  const [deadline, setDueDate] = useState(project.deadline);
  const [display, setDisplay] = useState("none");
  const [projectId, setProjectId] = useState(project.id);
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState(options[0]);
  const [flexDirection, setFlexDirection] = useState("");
  const [tagLabelColor, setTagLabelColor] = useState();
  const [tagLabelVisibility, setTagLabelVisibility] = useState("");
  const history = useHistory();
  const _isMounted = useRef(true);

  //#endregion
  const fetchProject = useCallback(() => {
    axios
      .get(link + "/projects/" + project.id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        if (_isMounted.current) {
          setFormatedDate(
            new Date(response.data.project.deadline).toLocaleDateString()
          );
          if (response.data.project.tag === "important") {
            setTagLabelColor("red");
            setTagLabelVisibility("");
          } else if (response.data.project.tag === "on hold") {
            setTagLabelColor("yellow ");
            setTagLabelVisibility("");
          } else setTagLabelVisibility("none");

          setTag(response.data.project.tag);

          if (response.data.project.view === "list")
            changeCurrentView(options[1]);
          else changeCurrentView(options[0]);
        }
      })
      .catch(function (error) {
        if (error.response) {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }

          //ukoliko ne postoji projekat
          else if (error.response.status === 404) {
            window.location.reload(false);
          }
          //ukoliko prijavljeni user nije team member
          if (error.response.status === 403) {
            history.push("/");
            fetchTeams();
          }
        }
      });
    //console.log(response.data);
  }, [project.id, history, fetchTeams]);

  const fetchLists = useCallback(() => {
    // const response = await
    //console.log(randomState);

    axios
      .get(link + "/lists/projects/" + project.id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        //console.log(response.data);
        if (_isMounted.current) {
          setLists(response.data);
          setActive(false);
          setIconClass("check icon");
        }
      })
      .catch(function (error) {
        if (error.response) {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (error.response.status === 404) {
            // ukoliko ne postoji projekat
            window.location.reload(false);
          }
          // nije clan tima
          else if (error.response.status === 403) {
            history.push("/");
            fetchTeams();
          }
        }
      });

    //console.log(response.data);
  }, [fetchTeams, history, project.id]);

  useEffect(() => {
    fetchProject();
    fetchLists();

    return () => {
      _isMounted.current = false;
    };
  }, [fetchLists, fetchProject]);

  const ChangeListFunction = () => {
    fetchLists();
  };

  const showForm = () => {
    setAddNewBoardState(true);
    setAddNewBoardBtn("none");
  };

  //#region archive
  // function archiveProject() {
  //   // arhiviraj lokalno
  //   projects.map((project) => {
  //     if (project.id === project.id) project.isArchived = true;
  //   });

  //   axios
  //     .patch(
  //       "https://cogit-api.herokuapp.com/projects/" + project.id,
  //       {
  //         isArchived: true,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     )
  //     .then(function (response) {
  //       console.log(response);
  //       console.log("arhiviranje projekta");
  //       const newProjects = projects.filter(isArchived);
  //       console.log(newProjects);
  //       setProjects(newProjects);
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // }
  ////#endregion

  function changeProjectName(name) {
    axios
      .patch(
        link + "/projects/" + project.id,
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        const projectId = project.id;
        const newProjects = projects.map((project) => {
          if (projectId === project.id) project.name = name;
          return project;
        });
        setProjects(newProjects);
      })
      .catch(function (error) {
        if (error.response) {
          setChangeNameMessageText(error.response.data.error);
          setErrorVisibility("visible");

          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (
            // ako nije tim leader, admin ga je razresio
            error.response.status === 403
          ) {
            window.location.reload(false);
          }
          // tim ne postoji
          else if (error.response.status === 404) {
            history.push("/");
            fetchTeams();
          }
        }
      });
  }

  function changeProjectDeadline(deadline) {
    axios
      .patch(
        link + "/projects/" + project.id,
        {
          deadline: deadline,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        // console.log(response);
        setFormatedDate(new Date(deadline).toLocaleDateString());
      })
      .catch(function (error) {
        //console.log(error.response.data.error);
        if (error.response) {
          setDateErrorVisibility("visible");

          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (
            // ako nije tim leader, admin ga je razresio
            error.response.status === 403
          ) {
            window.location.reload(false);
          }
          // tim ne postoji
          else if (error.response.status === 404) {
            history.push("/");
            fetchTeams();
          }
        }
      });
  }

  function changeProjectDescription(description) {
    if (description.length > 150) {
      setDescriptionErrorVisibility("visible");
      return;
    }
    axios
      .patch(
        link + "/projects/" + project.id,
        {
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        // console.log(response);
        const projectId = project.id;
        const newProjects = projects.map((project) => {
          if (project.id === projectId) project.description = description;
          return project;
        });
        setProjects(newProjects);
      })
      .catch(function (error) {
        if (error.response) {
          //console.log(error.response.data.error);
          setDescriptionErrorVisibility("visible");

          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (
            // ako nije tim leader, admin ga je razresio
            error.response.status === 403
          ) {
            window.location.reload(false);
          }
          // tim ne postoji
          else if (error.response.status === 404) {
            history.push("/");
            fetchTeams();
          }
        }
      });
  }

  function deleteProject() {
    axios
      .delete(
        link + "/projects/" + project.id,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        // console.log(response.data);
        // console.log("brisanje projekta");
        setProjects(response.data);
        // vracaju se i koji nisu arhivirani, ali nema veze, arhiviranje cemo da izbrisemo
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error);

          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (error.response.status === 404) {
            //ukoliko ne postoji projekat
            window.location.reload(false);
          }
          //ukoliko prijavljeni user nije team leader
          if (error.response.status === 403) {
            window.location.reload(false);
          }
        }
      });
  }

  function deleteList(listId) {
    const newLists = lists.filter((list) => list._id !== listId);
    setLists(newLists);

    axios
      .delete(
        link + "/lists/" + listId,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        //console.log(response.data);
        //console.log("brisanje liste");
        // fetchLists();
        setLists(response.data);
      })
      .catch(function (error) {
        if (error.response) {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }
          // ne postoji projekat
          // nije vodja tima
          else window.location.reload(false);
        }
      });
  }

  function AddNewBoard(name) {
    setIconClass("spinner loading icon");
    axios
      .post(
        link + "/lists/projects/" + project.id,
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        fetchLists();
      })
      .catch(function (error) {
        if (error.response) {
          setErrorMessage("visible");
          setErrorText(error.response.data.error);
          setIconClass("check icon");

          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (error.response.status === 404) {
            // ukoliko ne postoji projekat
            window.location.reload(false);
          }
          // nije vodja tima
          else if (error.response.status === 403) {
            window.location.reload(false);
          }
        }
      });
  }

  function changeCurrentView(value) {
    setSelected(value);

    if (value.value === "list") setFlexDirection("column");
    else setFlexDirection("row");
    // console.log("value: ");
    // console.log(value);
    // console.log(flexDirection);
  }

  function changeProjectTag(tag) {
    axios
      .patch(
        link + "/projects/" + project.id,
        {
          tag: tag,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        //console.log(response.data);
        setTag(tag);
        if (tag === "important") {
          setTagLabelColor("red");
          setTagLabelVisibility("");
        } else if (tag === "on hold") {
          setTagLabelColor("yellow");
          setTagLabelVisibility("");
        } else setTagLabelVisibility("none");
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.data.error);

          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (
            // ako nije tim leader, admin ga je razresio
            error.response.status === 403
          ) {
            window.location.reload(false);
          }
          // tim ne postoji
          else if (error.response.status === 404) {
            history.push("/");
            fetchTeams();
          }
        }
      });
  }

  useEffect(() => {
    if (user.teamLeader === true) {
      setDisplay("");
    } else {
      setDisplay("none");
    }
  }, [user]);

  //#region jsx

  return (
    <div className="ProjectContainer">
      <div className="ProjectUpper">
        <div
          className="currentProjectName"
          style={{
            position: "relative",
            backgroundColor: "rgba(209, 229, 245)",
          }}
        >
          {project.name}
          {/* ({tag}) */}
          <br />
          in team
          <br />
          {teamName}
          <div
            style={{
              left: "50%",
              zIndex: "1",
              top: "-1.4em",
              width: "max-content",
              display: `${tagLabelVisibility}`,
            }}
            className={`floating ui ${tagLabelColor} label`}
          >
            {tag}
          </div>
        </div>

        <div
          className="currentProjectName"
          style={{ backgroundColor: "rgba(209, 229, 245)" }}
        >
          Due date: {formatedDate}
        </div>

        <Dropdown
          label="Select a view"
          options={options}
          selected={selected}
          onSelectedChange={changeCurrentView}
        ></Dropdown>

        <div style={{ display: `${display}` }}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button
              style={{
                display: `${addNewBoardBtn}`,
                backgroundColor: " rgba(107, 185, 248, 0.801)",
              }}
              className="project ui button"
              onClick={showForm}
            >
              Add new board
            </button>
            <AddNewBoardComponent
              trigger={addNewBoardState}
              setTrigger={setAddNewBoardState}
              setAddNewBoardBtn={setAddNewBoardBtn}
              AddNewBoard={AddNewBoard}
              iconClass={iconClass}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              errorText={errorText}
              setErrorText={setErrorText}
            />

            <div style={{ position: "relative" }}>
              <button
                className="project ui button"
                style={{
                  display: `${addNewBoardBtn}`,
                  position: "relative",
                  backgroundColor: " rgba(107, 185, 248, 0.801)",
                }}
                onClick={() => {
                  setAddProjectSettingsForm(!addProjectSettingsForm);
                }}
              >
                Project settings
              </button>
              <div
                className="floating ui label"
                style={{
                  top: "-7.5em",
                  backgroundColor: "transparent",
                }}
              >
                <ProjectSettingsForm
                  trigger={addProjectSettingsForm}
                  setTrigger={setAddProjectSettingsForm}
                  deleteProject={deleteProject}
                  changeProjectName={changeProjectName}
                  changeNameMessageText={changeNameMessageText}
                  setErrorVisibility={setErrorVisibility}
                  errorVisibility={errorVisibility}
                  dateErrorVisibility={dateErrorVisibility}
                  setDateErrorVisibility={setDateErrorVisibility}
                  descriptionErrorVisibility={descriptionErrorVisibility}
                  setDescriptionErrorVisibility={setDescriptionErrorVisibility}
                  // projectID={projectID}
                  projectID={projectId}
                  dueDate={deadline}
                  changeProjectDeadline={changeProjectDeadline}
                  changeProjectDescription={changeProjectDescription}
                  changeProjectTag={changeProjectTag}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="ProjectDown"
        style={{ flexDirection: `${flexDirection}` }}
      >
        <ListsLoader active={active} height="300px" />
        <Lists
          lists={lists}
          setLists={setLists}
          deleteList={deleteList}
          projectName={project.name}
          dueDate={deadline}
          teamLeaderDisplay={display}
          projectID={projectId}
          ChangeListFunction={ChangeListFunction}
          fetchTeams={fetchTeams}
        />
      </div>
    </div>
  );

  //#endregion
};

export default Project;
