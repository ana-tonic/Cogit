import React, { useState, useEffect, useContext } from "react";
import "./Header.css";
import DeleteModalComponent from "./DeleteModalComponent";
import { TeamLeaderContext } from "../../context/TeamLeaderContext";

const Header = ({
  showForm,
  setShowForm,
  name,
  deleteList,
  listId,
  setActiveDeleteLoader,
}) => {
  const [user, setUser] = useContext(TeamLeaderContext);
  const [display, setDisplay] = useState("none");

  useEffect(() => {
    if (user.teamLeader === true) {
      setDisplay("");
      //console.log("hidden");
    } else {
      setDisplay("none");
      // console.log("hidden");
      // console.log(user);
      // console.log("user.leaderID: " + user.leaderId);
    }
  }, [user]);

  return (
    <div className="ui big label" style={{ cursor: "context-menu" }}>
      <div style={{ display: "flex", alignItems: "center" }}>{name}</div>

      <div style={{ cursor: "pointer", display: `${display}` }}>
        <DeleteModalComponent
          modalType={"icon"}
          buttonText={""}
          modalHeader={"Delete this board"}
          modalText={"Are you sure you want to delete this board?"}
          iconClass={"trash icon"}
          confirmFunction={deleteList}
          listId={listId}
        />
        <i
          className="plus icon"
          style={{ margin: "5px" }}
          onClick={() => setShowForm(!showForm)}
        ></i>
      </div>
    </div>
  );
};

export default Header;
