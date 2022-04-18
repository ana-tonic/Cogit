import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { Button, Modal } from "semantic-ui-react";
import EditTask from "./EditTask.js";
import link from "../API";

function exampleReducer(state, action) {
  switch (action.type) {
    case "close":
      return { open: false };
    case "open":
      return { open: true };
    default:
      throw new Error("Unsupported action...");
  }
}

const ModalTask = ({
  //#region props
  des,
  deadline,
  id,
  name,
  setName,
  isCompleted,
  setIsCompleted,
  description,
  setDescription,
  setDeadline,
  editors,
  projetDueDate,
  setFormatedDate,
  isTeamPriority,
  setIsTeamPriority,
  ChangeAssignment,
  disabled,
  closeTask,
  fetchTeams,
  fetchMembers,
  members,
  membersArray,
  setMembers,
  //#endregion
}) => {
  //#region states
  const [state, dispatch] = React.useReducer(exampleReducer, { open: false });
  const [ETMname, setETMname] = useState(name);
  const [ETMdescription, setETMdescription] = useState(des);
  const [ETMdeadline, setETMdeadline] = useState(deadline);
  const [ETMIsTeamPriority, ETMSetIsTeamPriority] = useState(isTeamPriority);
  const [ETMIsCompleted, ETMSetIsCompleted] = useState(isCompleted);
  // const membersArray = [];
  // const [members, setMembers] = useState();
  const currTeam = useLocation().pathname.split("/")[1];
  const history = useHistory();
  const _isMounted = useRef(true);
  //#endregion
  //#region neki console.logovi
  // console.log(deadline);
  // console.log("ETMdeadline: " + ETMdeadline);
  // console.log("ETMname: " + ETMname);

  // console.log("name: " + name);
  // console.log("ETMname: " + ETMname);
  // console.log("description " + description);
  // console.log("ETMdescription" + ETMdescription);
  //#endregion

  useEffect(() => {
    fetchMe();

    return () => {
      _isMounted.current = false;
    };
  }, []);

  async function fetchMe() {
    axios
      .get(link + "/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (_isMounted.current) {
          //console.log(response.data);
          fetchMembers(response.data.id);
        }
      })
      .catch((error) => {
        console.log(error);
        localStorage.removeItem("token");
        window.location.reload(false);
      })
      .finally((a) => {});
  }

  // function fetchMembers(leaderId) {
  //   axios
  //     .get("https://cogit-api.herokuapp.com/teams/" + currTeam + "/members", {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     })
  //     .then(function (response) {
  //       if (_isMounted.current) {
  //         response.data.map((user) => {
  //           membersArray.push(user);
  //           setMembers(membersArray);
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       // console.log(error);
  //       // console.log(currTeam);

  //       // ukoliko korisnik nije pronadjen
  //       if (error.response.status === 470) {
  //         localStorage.removeItem("token");
  //         window.location.reload(false);
  //       }
  //       // ukoliko tim ne postoji
  //       else if (
  //         error.response.status === 404 ||
  //         error.response.status === 403
  //       ) {
  //         history.push("/");
  //         fetchTeams();
  //       } else console.log(error);
  //     });
  // }

  function updateTask() {
    // console.log("name: " + name);
    // console.log("description: " + description);
    // console.log("deadline: " + deadline);
    //console.log(deadline);
    console.log(ETMIsCompleted);

    setName(ETMname);
    setDeadline(ETMdeadline);
    const formatedDate = new Date(ETMdeadline).toLocaleDateString();
    setFormatedDate(formatedDate);
    setDescription(ETMdescription);
    setIsCompleted(ETMIsCompleted);

    setIsTeamPriority(ETMIsTeamPriority, ETMIsCompleted);
    // console.log("formatedDate: " + formatedDate);
    // console.log(ETMdeadline);

    axios
      .patch(
        link + "/tasks/" + id,
        {
          name: ETMname,
          deadline: ETMdeadline,
          description: ETMdescription,
          isCompleted: ETMIsCompleted,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        console.log(response);
      })

      .catch(function (error) {
        // ukoliko korisnik nije pronadjen
        // console.log(error.response.data.error);
        // console.log(error.response.status);
        if (error.response !== undefined) {
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (error.response.status === 404) {
            window.location.reload(false);
          }

          // ukoliko prijavljeni user nije team memeber
          else if (error.response.status === 403) {
            // ukoliko prijavljeni user nije team leader
            if (
              error.response.data.error ===
              "Not authorized.  To access this document you need to be team leader."
            ) {
              console.log(error.response.data.error);
              console.log(error.response.status);
            }
            // history.push("/");
            // fetchTeams();
          }
        }
      });
  }

  return (
    <>
      <button
        className="ui button"
        onClick={() => dispatch({ type: "open" })}
        style={{
          marginBottom: "5px",
          backgroundColor: " #237DC3",
          color: "white",
        }}
      >
        <i className="edit icon"></i>
        Edit
      </button>

      <Modal
        size={"tiny"}
        open={state.open}
        onClose={() => dispatch({ type: "close" })}
      >
        <Modal.Content scrolling>
          <EditTask
            name={ETMname}
            setName={setETMname}
            isCompleted={ETMIsCompleted}
            setIsCompleted={ETMSetIsCompleted}
            description={ETMdescription}
            setDescription={setETMdescription}
            deadline={ETMdeadline}
            setDeadline={setETMdeadline}
            editors={editors}
            projetDueDate={projetDueDate}
            isTeamPriority={ETMIsTeamPriority}
            setIsTeamPriority={ETMSetIsTeamPriority}
            members={members}
            ChangeAssignment={ChangeAssignment}
            disabled={disabled}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => dispatch({ type: "close" })}>
            Discard
          </Button>

          <Button
            positive
            onClick={() => {
              dispatch({ type: "close" });
              updateTask();
            }}
          >
            Save
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default ModalTask;
