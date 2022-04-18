import React, { useContext, useEffect, useState } from "react";
import { Switch, Route, useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import NavRoute from "./NavRoute";
import Login from "./Login";
import Register from "./Register";
import "../style/MainForm.css";
import useToken from "./useToken";
import useTheme from "./DarkMode";
import { CurrentTeamContext } from "../context/CurrentTeamContext";
import ProfileIcon from "./ProfileIcon";
import TeamsPage from "./TeamPage/teamsPage";
import { useSocket } from "../context/SocketProvider";
import TeamNav from "./TeamNav";
import AdminPage from "./Admin/AdminPage";
import ProfilePage from "./ProfilePage";
import ActivityList from "./ActivityPage/listOfActivities";
import ChatPage from "./Chat - direct messages/chatPage";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext.js";
import link from "./API";

const LoggedIn = () => {
  const [user, setUser] = useContext(UserContext);
  const [load, setLoad] = useState(true);
  const [active, setActive] = useState("active");
  const [listTeams, setListTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useContext(CurrentTeamContext);
  const currTeam = useLocation().pathname.split("/")[1];
  const [admin, setAdmin] = useState(null);
  const { darkMode, setDarkMode } = useTheme();
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const str = admin === true ? "all" : "me";
  const teamId = useLocation().pathname.split("/")[1];

  const fetchTeams = () => {
    if (admin != null) {
      axios
        .get(link + "/teams/" + str, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {
          setListTeams(value.data);
        })
        .catch((error) => {
          if (error.response !== undefined && error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }
        })
        .finally((a) => {
          setActive("");
          setTeamsLoaded(true);
        });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [admin]);

  if (load) {
    setActive("active");

    axios
      .get(link + "/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((value) => {
        setDarkMode(value.data.settings.theme);
        if (value.data.settings.theme === "dark") {
          document.body.style.backgroundImage =
            "url(" +
            "https://www.transparenttextures.com/patterns/cartographer.png" +
            ")";
        } else {
          document.body.style.backgroundImage = "";
        }
        if (value.data.email === "admin@gmail.com") setAdmin(true);
        else setAdmin(false);
        setUser({
          id: value.data._id,
          admin: value.data.role === "admin" ? true : false,
          email: value.data.email,
          username: value.data.username,
          avatar: value.data.avatar.name,
          avatarSrc: `data:image/png;base64,${value.data.avatar.picture}`,
        });
        if (admin !== null) fetchTeams();
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data);
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }
        }
      })
      .finally((a) => {
        setUserLoaded(true);
      });

    setLoad(false);
  }

  //console.log(user);

  const localTeamsPage = () => {
    return (
      <TeamsPage
        admin={user.admin}
        userId={user.id}
        active={active}
        listTeams={listTeams}
        setListTeams={setListTeams}
        fetchTeams={fetchTeams}
      />
    );
  };

  const ActivityListPage = () => {
    if (teamsLoaded && userLoaded)
      return (
        <div>
          <div>
            <Link to={`/`} style={{ color: "red" }}>
              <i
                className="arrow alternate circle left icon big link  icon"
                style={{ margin: "10px" }}
              ></i>
            </Link>
          </div>
          <ActivityList />
        </div>
      );
    else return <div></div>;
  };

  const TeamListChatPage = () => {
    return (
      <div>
        <div>
          <Link to={`/`} style={{ color: "red" }}>
            <i
              className="arrow alternate circle left icon big link icon"
              style={{ margin: "10px" }}
            ></i>
          </Link>
        </div>
        <ChatPage />
      </div>
    );
  };
  const TeamListProfilePage = () => {
    return (
      <div>
        <div>
          <Link to={`/`} style={{ color: "red" }}>
            <i
              className="arrow alternate circle left icon big link  icon"
              style={{ margin: "10px" }}
            ></i>
          </Link>
        </div>
        <ProfilePage />
      </div>
    );
  };

  //console.log(load);

  if (
    currTeam &&
    currTeam !== "Admin" &&
    currTeam !== "Activity" &&
    currTeam !== "Chat" &&
    currTeam !== "Settings"
  ) {
    return (
      <div className="MainForm">
        <NavRoute
          listTeams={listTeams}
          currTeam={currTeam}
          fetchTeams={fetchTeams}
          userId={user.id}
        />
        <div className="RightMainForm">
          <ProfileIcon currTeam={currTeam} />

          <TeamNav listTeams={listTeams} fetchTeams={fetchTeams} />
        </div>
      </div>
    );
  } else {
    return (
      <Switch>
        <Route path="/" exact component={localTeamsPage} />
        <Route path="/Admin" exact component={AdminPage} />
        <Route path="/Activity" exact component={ActivityListPage} />
        <Route path="/Chat" exact component={TeamListChatPage} />
        <Route path="/Settings" exact component={TeamListProfilePage} />
      </Switch>
    );
  }
};

function MainForm() {
  const { token, setToken } = useToken();
  const LoginForm = () => <Login setToken={setToken} />;
  const RegisterForm = () => <Register setToken={setToken} />;
  const [socketSetup, setSocketSetup] = useState(true);
  let history = useHistory();

  const socket = useSocket();

  if (socketSetup) {
    if (socket) {
      socket.on("connect_error", (err) => {
        socket.emit("keep-alive");
        console.log(err.message);
      });

      socket.on("check-connection", () => {
        socket.emit("keep-alive");
        //console.log("ping");
      });

      setSocketSetup(false);
    }
  }

  if (token) {
    return <LoggedIn />;
  } else {
    history.push("/");
    return (
      <Switch>
        <Route path="/Register" exact component={RegisterForm} />
        <Route path="/" component={LoginForm} />
      </Switch>
    );
  }
}

export default MainForm;
