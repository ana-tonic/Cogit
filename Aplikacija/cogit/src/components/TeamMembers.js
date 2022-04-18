import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useLocation, useHistory } from "react-router-dom";
import "../style/TeamMembers.css";
import AddNewMemberForm from "./AddNewMemberForm";
import axios from "axios";
import TeamMemberList from "./TeamMemberList";
import { TeamLeaderContext } from "../context/TeamLeaderContext";
import { UserContext } from "../context/UserContext";
import link from "./API";

const TeamMembers = ({ fetchTeams, teamName }) => {
  //#region states
  const [addMember, addNewMember] = useState(false);
  const [addMemberBtn, setAddMemberBtn] = useState("");
  const [members, setMembers] = useState([""]);
  const currTeam = useLocation().pathname.split("/")[1];
  const [user, setUser] = useContext(TeamLeaderContext);
  const [userInfo, setUserInfo] = useContext(UserContext);
  const [display, setDisplay] = useState("none");
  const [name, setTeamName] = useState(teamName);
  const history = useHistory();
  const _isMounted = useRef(true);
  //#endregion

  const getMembers = useCallback(() => {
    if (currTeam) {
      axios
        .get(`${link}/teams/${currTeam}/members`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {
          if (_isMounted.current) {
            setMembers(value.data);
          }
        })
        .catch((error) => {
          console.log(error.response.data.error);
          // ako je izbacen iz tima
          // ako je tim obrisan
          if (error.response.status === 404 || error.response.status === 403) {
            history.push("/");
            fetchTeams();
          }
          // obrisan user
          else if (
            error.response !== undefined &&
            error.response.status === 470
          ) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }
        });
    }
  }, [currTeam, fetchTeams, history]);

  useEffect(() => {
    if (user.teamLeader || userInfo.admin) {
      setDisplay("");
    } else {
      setDisplay("none");
    }

    getMembers();

    return () => {
      _isMounted.current = false;
    };
  }, [user, userInfo.admin, getMembers]);

  // useEffect(() => {
  //   ;
  //   // console.log(name);

  // }, [getMembers]);

  function AddNewMember(username) {
    axios
      .patch(
        `${link}/users/username/${username}/teams/${currTeam}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((value) => {
        //console.log(value);
        getMembers();
      })
      .catch((error) => {
        console.log(error.response.status + " " + error.response.data.error);

        if (error.response.status === 404) {
          if (error.response.data.error === "User not found.") {
            alert(error.response.data.error);
          }
          // izbacen iz tima ili tim obrisan
          else {
            history.push("/");
            fetchTeams();
          }
        }
        // nije vise team leader
        else if (error.response.status === 403) {
          window.location.reload(false);
        }
        // obrisan user
        else if (
          error.response !== undefined &&
          error.response.status === 470
        ) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }
      });
  }

  const showForm = () => {
    addNewMember(true);
    setAddMemberBtn("none");
  };

  // console.log(teamName);

  return (
    <div className="TeamMembers container">
      <div className="TeamMembers Upper">
        <h3 className="ui header">
          <i className="users icon"></i>
          <div className="content">Team members of {teamName}</div>
        </h3>

        <div style={{ display: `${display}` }}>
          <button
            className="ui button"
            style={{
              display: `${addMemberBtn}`,
              backgroundColor: " #237dc3",
              color: "white",
            }}
            onClick={showForm}
          >
            Add new member
          </button>
          <AddNewMemberForm
            AddNewMember={AddNewMember}
            trigger={addMember}
            setTrigger={addNewMember}
            AddMemberBtn={setAddMemberBtn}
          />
        </div>
      </div>

      <div className="TeamMembers Down">
        <div>
          <div className="ui equal width grid">
            <div className="two wide column"></div>
            <div className="four wide column">Name</div>
            <div className="three wide column">Role</div>
            <div className="four wide column"></div>
            <div className="three wide column"></div>
          </div>
          <hr />
          <div className="TeamMembers ui large list">
            <TeamMemberList
              setMembers={setMembers}
              members={members}
              getMembers={getMembers}
              display={display}
              fetchTeams={fetchTeams}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
