import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import ModalComponent from "../ModalComponent";
import CommentsList from "./CommentsList";
import EditorsList from "./EditorsList";
import axios from "axios";
import ListsLoader from "../Project/ListsLoader";
import EditTaskModal from "../Project/EditTaskModal";
import Dropdown from "../Project/CustomDropDown";
import "./MyTask.css";
import link from "../API";

const MyTask = ({
  //#region
  changeState,
  projectName,
  listName,
  id,
  deleteTask,
  projetDueDate,
  name,
  des,
  setName,
  deadline,
  teamLeaderDisplay,
  isTeamPriority,
  setIsTeamPriority,
  isCompleted,
  setIsCompleted,
  dispatch,
  setTaskDisplay,
  lists,
  display, //exclamation mark display
  changeDisplay,
  fetchTeams,
  closeTask,
  listId,
  //#endregion
}) => {
  //#region states
  const [active, setActive] = useState(true); //Loader for fetching the first time
  const [commentText, setCommentText] = useState("");
  //const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDeadline] = useState("");
  const [editors, setEditors] = useState([]);
  const [comments, setComments] = useState([]);
  const [formatedDate, setFormatedDate] = useState("");
  const [disabled, setDisabled] = useState("");
  const [selected, setSelected] = useState("");
  const [options, setOptions] = useState([]);
  const [pointerEvents, setPointerEvents] = useState("");
  const [pointerEventsSendTo, setPointerEventsSendTo] = useState("");
  const [errorVisibility, setErrorVisibility] = useState("hidden");
  const [errorText, setErrorText] = useState("");
  const membersArray = [];
  const [members, setMembers] = useState();
  const history = useHistory();
  const _isMounted = useRef(true);
  const currTeam = useLocation().pathname.split("/")[1];
  //#endregion

  useEffect(() => {
    fetchTask();

    return () => {
      _isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (lists) {
      lists.map((list) => {
        if (listId !== list.id) {
          const option = {
            label: list.name,
            value: list.id,
          };

          if (_isMounted.current)
            setOptions((prevState) => [...prevState, option]);
        }
      });
    }
  }, []);

  function fetchTask() {
    axios
      .get(link + "/tasks/" + id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        // if (_isMounted.current) {
        //console.log(response.data);
        setActive(false);
        setName(response.data.name);
        setDescription(response.data.description);
        setDeadline(response.data.deadline);
        setEditors(response.data.editors);
        setComments(response.data.comments);

        setFormatedDate(new Date(response.data.deadline).toLocaleDateString());
        //}
      })
      .catch(function (error) {
        if (error.response) {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          }

          //ukoliko je task obrisan;
          if (error.response.status === 404) {
            // zatvoriti modal komponentu
            dispatch({ type: "close" });

            //obrisati task iz prikaza
            setTaskDisplay("none");
          }

          // ukoliko prijavljeni user nije team memeber
          else if (error.response.status === 403) {
            history.push("/");
            fetchTeams();
          }
        }
      });
    //console.log(response.data);
  }

  const AddNewComment = () => {
    setPointerEvents("none");
    const text = commentText;
    setCommentText("");

    axios
      .post(
        link + "/comments/tasks/" + id,
        {
          text: text,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        //sole.log(response.data);
        setComments((prevState) => [...prevState, response.data]);
        //console.log(comments);
        setCommentText("");
        //console.log(response.status);
      })
      .catch(function (error) {
        //console.log(error.response.data.error);
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }

        // ukoliko task ne postoji
        if (error.response.status === 404) {
          // zatvoriti modal komponentu
          dispatch({ type: "close" });

          //obrisati task iz prikaza
          setTaskDisplay("none");
        }
        // ukoliko prijavljeni user nije team memeber
        else if (error.response.status === 403) {
          history.push("/");
          fetchTeams();
        } else if (error.response.status === 422) {
          // console.log(error.response.data.error);
          setErrorVisibility("visible");
          setErrorText(error.response.data.error);
        }
      })
      .finally(() => setPointerEvents(""));
  };

  const ChangeAssignment = (userId) => {
    setDisabled("none");

    axios
      .patch(
        link + "/tasks/" + id + "/users/" + userId,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        //console.log(response.data);
        setEditors(response.data);
        setDisabled("");

        // kad team leader sam sebi assignuje ili skine zadatak
        if (teamLeaderDisplay === "") {
          changeDisplay();
        }
        // if (display === "") display = "none";
        // else display = "";
      })
      .catch(function (error) {
        // console.log(error.response.data.error);
        // console.log(error.response.status);
        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        } else if (error.response.status === 404) {
          // ukoliko je obrisan taj user kome zelimo da dodelimo ili skinemo task
          if (error.response.data.error === "User not found") {
            console.log(members);
            setMembers(members.filter((member) => member.id !== userId));
            setDisabled("");
          } else {
            // ukoliko task ne postoji
            // zatvoriti modal komponentu
            dispatch({ type: "close" });

            //obrisati task iz prikaza
            setTaskDisplay("none");
          }
        }
        // ukoliko prijavljeni user nije team leader, admin ga je promenio
        else if (error.response.status === 403) {
          window.location.reload(false);
        }
      });
  };

  const ChangeList = () => {
    // dispatch({ type: "close" });
    setPointerEventsSendTo("none");
    console.log("menjanje liste");
    //console.log(selected.value);
    axios
      .patch(
        link + "/tasks/" + id + "/lists/" + selected.value,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(function (response) {
        console.log(response.data);
        setTaskDisplay("none");
        dispatch({ type: "close" });
        changeState();
        //window.location.reload(false);
        setPointerEventsSendTo("");
      })
      .catch(function (error) {
        //   console.log(error.response.data.error);
        //   console.log(error.response.status);

        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        } else if (error.response.status === 404) {
          // zatvoriti modal komponentu
          dispatch({ type: "close" });

          //obrisati task iz prikaza
          setTaskDisplay("none");
        } else if (error.response.status === 403) {
          console.log(error.response.data.error);
          // za slucaj da je izbacen iz tima
          if (
            error.response.data.error ===
            "Not authorized. To access this document you need to be team member."
          ) {
            history.push("/");
            fetchTeams();
          }
          // ili da nije vise team leader
          // za slucaj da mu je samo oduzet zadatak
          else window.location.reload(false);
        }
      });
  };

  const deleteComment = (id) => {
    function checkId(value) {
      return value._id !== id;
    }

    const newComments = comments.filter(checkId);
    // console.log(newComments);
    setComments(newComments);

    axios
      .delete(
        link + "/comments/" + id,

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
        if (error.response) {
          // ukoliko korisnik nije pronadjen
          if (error.response.status === 470) {
            localStorage.removeItem("token");
            window.location.reload(false);
          } else if (error.response.status === 404) {
            if (error.response.data.error === "Comment not found") {
            }
            //ukoliko ne postoji lista
            else window.location.reload(false);
          } else if (error.response.status === 403) {
            // ako je korisnik izbacen iz tima
            if (
              error.response.data.error ===
              "Not authorized.  To access this document you need to be team member."
            ) {
              history.push("/");
              fetchTeams();
            }
            //ukoliko prijavljeni user nije team leader ili kreator komentara
            else window.location.reload(false);
          }
        }
      });
  };

  function fetchMembers() {
    axios
      .get(link + "/teams/" + currTeam + "/members", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(function (response) {
        if (_isMounted.current) {
          response.data.map((user) => {
            membersArray.push(user);
            setMembers(membersArray);
          });
        }
      })
      .catch((error) => {
        // console.log(error);
        // console.log(currTeam);

        // ukoliko korisnik nije pronadjen
        if (error.response.status === 470) {
          localStorage.removeItem("token");
          window.location.reload(false);
        }
        // ukoliko tim ne postoji
        else if (
          error.response.status === 404 ||
          error.response.status === 403
        ) {
          history.push("/");
          fetchTeams();
        } else console.log(error);
      });
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      AddNewComment();
    }
  };

  return active ? (
    <ListsLoader active={active} height="300px" />
  ) : (
    <div className="ui segment">
      <div className="ui segment">
        <p>Project "{projectName}"</p>
      </div>

      <div className="ui grid">
        <div className="left floated nine wide column">
          <h3 className="ui header">
            <i className="check icon"></i>
            <div className="content">
              {name}
              <div className="sub header">in list "{listName}"</div>
            </div>
          </h3>

          <h5 className="ui header">
            <i className="calendar alternate icon"></i>
            <div className="content">
              Due date
              <div className="sub header">{formatedDate}</div>
            </div>
          </h5>
        </div>
        <div
          className="right floated five wide column"
          style={{ display: `${teamLeaderDisplay}` }}
        >
          <div className=" ui vertical buttons">
            <EditTaskModal
              id={id}
              name={name}
              setName={setName}
              isCompleted={isCompleted}
              setIsCompleted={setIsCompleted}
              description={description}
              setDescription={setDescription}
              deadline={deadline}
              setDeadline={setDeadline}
              setFormatedDate={setFormatedDate}
              editors={editors}
              projetDueDate={projetDueDate}
              des={des}
              isTeamPriority={isTeamPriority}
              setIsTeamPriority={setIsTeamPriority}
              ChangeAssignment={ChangeAssignment}
              disabled={disabled}
              closeTask={closeTask}
              fetchTeams={fetchTeams}
              fetchMembers={fetchMembers}
              members={members}
              membersArray={membersArray}
              setMembers={setMembers}
            />

            <ModalComponent
              disable={false}
              modalType={"button"}
              buttonText={"Delete"}
              modalHeader={"Delete this task"}
              modalText={"Are you sure you want to delete this task?"}
              iconClass={"trash alternate icon"}
              Confirm={deleteTask}
              id={id}
            />
          </div>
        </div>
      </div>

      <div className="ui form" style={{ marginTop: "15px" }}>
        <div className="field">
          <label>
            <i className="pencil alternate icon"></i>
            Description
          </label>
          {/* <textarea rows="2"></textarea> */}
          <div className="ui segment" style={{ marginBottom: "15px" }}>
            {description}
          </div>
        </div>
      </div>

      <p>
        <i className="user icon"></i>Assigned to
      </p>
      <div className="ui segment">
        <div className="ui large list">
          <EditorsList editors={editors} />
        </div>
      </div>

      <div style={{ display: `${display}` }} className="changeListContainer">
        <button
          className="ui button"
          onClick={() => ChangeList()}
          style={{
            pointerEvents: `${pointerEventsSendTo}`,
            backgroundColor: " #237DC3",
            color: "white",
            height: "40px",
            marginTop: "20px",
          }}
        >
          Send to
        </button>
        <Dropdown
          label="Select a list"
          options={options}
          selected={selected}
          onSelectedChange={setSelected}
        ></Dropdown>
      </div>

      <p>
        <i className="comment alternate outline icon"></i>Comments
      </p>
      <div className="ui segment">
        <div className="ui comments">
          <CommentsList
            comments={comments}
            setComments={setComments}
            fetchTeams={fetchTeams}
            deleteComment={deleteComment}
            teamLeaderDisplay={teamLeaderDisplay}
          />
        </div>

        <form className="ui tiny reply form">
          <div className="field">
            <textarea
              rows="2"
              onChange={(e) => {
                setCommentText(e.target.value);
                setErrorVisibility("hidden");
              }}
              value={commentText}
              onKeyDown={handleKeyDown}
            ></textarea>
          </div>

          <div className={`ui ${errorVisibility} error message`}>
            <i
              className="close icon"
              onClick={() => setErrorVisibility("hidden")}
            ></i>
            <div className="header"></div>
            {/* <p style={{ marginRight: "5px" }}>{changeNameMessageText}</p> */}
            <p style={{ marginRight: "5px" }}>{errorText}</p>
          </div>

          <div
            className="ui primary submit labeled icon button"
            onClick={() => AddNewComment()}
            style={{
              pointerEvents: `${pointerEvents}`,
            }}
          >
            {" "}
            <i className="icon edit"></i> Add Comment
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyTask;
