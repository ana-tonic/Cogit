import React from "react";
import { useHistory } from "react-router-dom";
import "../style/Nav.css";
import { useEffect, useContext, useState, useRef } from "react";
import GroupChat from "./GroupChat";
import NewProjectForm from "./NewProjectForm";
import { CurrentProjectProvider } from "../context/CurrentProjectContext.js";
import { ProjectContext } from "../context/ProjectContext";
import { TeamLeaderContext } from "../context/TeamLeaderContext";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import ProjectList from "./ProjectList";
import ListsLoader from "./Project/ListsLoader";
import link from "./API";

function Nav({ currTeam, fetchTeams }) {
	//#region state
	const [user, setUser] = useContext(TeamLeaderContext);
	const [projects, setProjects] = useContext(ProjectContext);
	const [userInfo, setUserInfo] = useContext(UserContext);
	const [newProject, setNewProject] = useState(false);
	const [displayProjectsList, setDisplayProjectsList] = useState("none");
	const [activeLoader, setActiveLoader] = useState(true);
	const [display, setDisplay] = useState("hidden");
	const history = useHistory();
	const _isMounted = useRef(true);
	//#endregion

	useEffect(() => {
		fetchProjects();

		return () => {
			_isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		// console.log(userInfo.id);
		checkUser();

		return () => {
			_isMounted.current = false;
		};
	}, [userInfo]);

	const showForm = () => {
		setNewProject(!newProject);
	};
	//console.log(userInfo);

	const checkUser = () => {
		//   console.log(userInfo.avatar);
		//   console.log(userInfo.id);
		//   console.log(user.teamLeader);

		if (userInfo.avatar === "Placeholder") {
			//   console.log("prvi if");
			axios
				.get(link + "/users/me", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				})
				.then(value => {
					// if (_isMounted.current) {
					setUserInfo({
						id: value.data._id,
						admin: value.data.role === "admin" ? true : false,
						email: value.data.email,
						username: value.data.username,
						avatar: value.data.avatar.name,
						avatarSrc: `data:image/png;base64,${value.data.avatar.picture}`,
					});
					// }
				})
				.catch(error => {
					console.log(error.response.error.data);
					if (error.response.status === 470) {
						localStorage.removeItem("token");
						window.location.reload(false);
					}
				})
				.finally(a => {});
		}

		// kad se ovde radi fetch onda se resava problem prikaza kad neko postane team leader
		if (userInfo.id !== "") {
			fetchTeam(userInfo.id, userInfo.admin);
			// console.log(userInfo);
		}
		//#region comments
		//console.log(userInfo);
		// else if (userInfo.avatar !== "Placeholder" && user.team !== currTeam) {
		//   // pribaviti team
		//   console.log("else if");
		//   setUser((prevState) => ({
		//     team: currTeam,
		//     teamLeader: prevState.teamLeader,
		//   }));

		//   // pribaviti leaderId i postaviti context
		//   axios
		//     .get("https://cogit-api.herokuapp.com/teams/" + currTeam, {
		//       headers: {
		//         Authorization: `Bearer ${localStorage.getItem("token")}`,
		//       },
		//     })
		//     .then((response) => {
		//       //console.log(response.data);
		//       //console.log("userInfo.id: " + userInfo.id);
		//       //console.log("response.data.leaderId: " + response.data.leaderId);
		//       if (userInfo.id === response.data.leaderId) {
		//         setUser({
		//           team: currTeam,
		//           teamLeader: true,
		//         });
		//         console.log("Jeste team leader!");
		//         setDisplay("");
		//       } else {
		//         setUser({
		//           team: currTeam,
		//           teamLeader: false,
		//         });
		//         console.log("Nije team leader!");
		//         setDisplay("hidden");
		//       }
		//     })
		//     .catch((error) => {
		//       if (error.response) {
		//         console.log(error.response.data.error);
		//         // ako tim ne postoji
		//         history.push("/");
		//         fetchTeams();
		//       }
		//     })
		//     .finally(() => {});
		//#endregion
	};

	const fetchTeam = (userId, userRole) => {
		axios
			.get(link + "/teams/" + currTeam, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			.then(response => {
				//console.log(userRole);
				// if (_isMounted.current) {
				if (userId === response.data.leaderId || userRole === true) {
					setUser({
						team: currTeam,
						teamLeader: true,
					});
					//   console.log("Jeste team leader!");
					setDisplay("");
				} else {
					setUser({
						team: currTeam,
						teamLeader: false,
					});
				}
			})
			.catch(error => {
				if (error.response !== undefined && error.response.status === 470) {
					localStorage.removeItem("token");
					window.location.reload(false);
				}
			})
			.finally(() => {});
	};

	const fetchProjects = () => {
		axios
			.get(link + "/projects/teams/" + currTeam, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			//console.log(response.data);
			.then(function (response) {
				// if (_isMounted.current) {
				setProjects(response.data);
				setActiveLoader(false);
				setDisplayProjectsList("");
				// }
			})
			.catch(function (error) {
				console.log(error.response.status);

				if (error.response) {
					// ukoliko korisnik nije pronadjen
					if (error.response.status === 470) {
						localStorage.removeItem("token");
						window.location.reload(false);
					}

					// ukoliko prijavljeni user nije team memeber
					else if (error.response.status === 403) {
						console.log("fetchProjects - nije team member");
						history.push("/");
						fetchTeams();
					}

					// ukoliko je tim obrisan
					else if (error.response.status === 404) {
						history.push("/");
						fetchTeams();
					}
				}
			});
	};

	return (
		<div className="LeftMainForm">
			<div
				className="ui vertical menu"
				style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
			>
				<div
					className="item"
					style={{
						padding: ".5em 1em",
					}}
				>
					Projects
					<i
						className={`noviProjekat plus icon ${display}`}
						onClick={showForm}
					></i>
					<NewProjectForm
						trigger={newProject}
						currentTeam={currTeam}
						setProjects={setProjects}
						projects={projects}
						fetchTeams={fetchTeams}
						showForm={showForm}
					/>
					{/* <Dropdown>
            <Dropdown.Menu>
              <Dropdown.Header>Filter</Dropdown.Header>
              <Dropdown.Item>All</Dropdown.Item>
              <Dropdown.Item>None</Dropdown.Item>
              <Dropdown.Item>Ready</Dropdown.Item>
              <Dropdown.Item>On Hold</Dropdown.Item>
              <Dropdown.Item>Important</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
					<div
						className="nav ui large list"
						style={{
							display: `${displayProjectsList}`,
						}}
					>
						<CurrentProjectProvider>
							<ProjectList currentTeam={currTeam} projects={projects} />
						</CurrentProjectProvider>
					</div>
					<ListsLoader active={activeLoader} height="100px" />
				</div>
			</div>
			<GroupChat />
		</div>
	);
}

export default Nav;
