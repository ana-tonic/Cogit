import React, { useState, useContext } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import ModalComponent from "./ModalComponent";
import link from "./API";
import { TeamLeaderContext } from "../context/TeamLeaderContext";

const TeamMember = (
  //#region props
  {
    admin,
    buttonLock,
    setButtonLock,
    me,
    id,
    name,
    role,
    avatar,
    getMembers,
    display,
    fetchTeams,
    user,
    setMembers,
    members,
  }
) =>
  //#endregion
  {
    //#region states
    const avatarSrc = `data:image/png;base64,${avatar.picture}`;
    const [loader, setLoader] = useState("");
    const currTeam = useLocation().pathname.split("/")[1];
    const [lock, setLock] = useState(true);
    const history = useHistory();
    const [en, setEn] = useState((me.id === id || !me.leader) && !admin);

    if (en !== (me.id === id || !me.leader) && !admin)
      setEn((me.id === id || !me.leader) && !admin);

    //#endregion

    function PromoteToLeader() {
      setLoader("loading");
      axios
        .patch(
          link + "/teams/" + currTeam,
          {
            leaderId: id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((value) => {
          setLoader("");
          if (user.admin === true) {
            // console.log("admin promotuje");
            getMembers();
          } else {
            setButtonLock(false);
            window.location.reload(false);
          }
        })
        .catch((error) => {
          console.log(error.response.data.error);
          //+ " " + error.response.status
          // ako korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (
            // ako nije tim leader, admin ga je razresio
            // ako je user vec izbacen iz tima
            error.response.status === 403 ||
            error.response.status === 400 ||
            // ako je user vec obrisan
            (error.response.status === 404 &&
              error.response.data.error === "User not found.")
          ) {
            getMembers();
          }
          // ako je lider izbacen iz tima
          // ako je obrisan tim
          else {
            history.push("/");
            fetchTeams();
          }
        })
        .finally((a) => {});
    }

    if (lock) {
      if (!buttonLock) {
        setEn(true);
        console.log("enset");
        setLock(false);
      }
    }

    function removeMember() {
      //console.log(props.id);
      setMembers(members.filter((member) => member._id !== id));
      if (me !== id) {
        axios
          .patch(
            `${link}/users/${id}/remove/teams/${currTeam}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then((value) => {
            //console.log(value.data);
            //getMembers();
          })
          .catch((error) => {
            console.log(
              error.response.data.error + " " + error.response.status
            );
            // ako korisnik nije pronadjen
            if (error.response.status === 470) {
              localStorage.removeItem("token");
              window.location.reload(false);
            } else if (
              // ako nije tim leader, admin ga je razresio
              // ako je user vec izbacen iz tima
              error.response.status === 403 ||
              error.response.status === 400
            ) {
              window.location.reload(false);
            }
            // ako je user vec obrisan
            else if (error.response.status === 404) {
              if (error.response.data.error === "User not found.")
                window.location.reload(false);
              // ako je izbacen iz tima
              // ako je obrisan tim
              else {
                history.push("/");
                fetchTeams();
              }
            }
          })
          .finally((a) => {});
      }
    }

    return (
      <div className="ui equal width grid">
        <div className="two wide column">
          <img className="ui mini image" src={avatarSrc} alt={avatar.name} />
        </div>

        <div className="four wide column">
          <span>{name}</span>
        </div>

        <div className="three wide column">
          <span>{role}</span>
        </div>

        <div className="four wide column">
          <button
            disabled={en}
            className={`ui button ${loader}`}
            onClick={PromoteToLeader}
            style={{ backgroundColor: " #237dc3", color: "white" }}
          >
            Promote to team leader
          </button>
        </div>

        <div className="three wide column" style={{ display: `${display}` }}>
          <ModalComponent
            disable={en}
            Confirm={removeMember}
            modalType={"button"}
            buttonText={"Remove"}
            modalHeader={"Remove member"}
            modalText={"Are you sure you want to remove this member?"}
            iconClass={"alternate trash icon"}
          />
        </div>
      </div>
    );
  };

export default TeamMember;
