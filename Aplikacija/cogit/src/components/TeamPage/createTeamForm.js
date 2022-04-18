import React, { useReducer } from "react";
import TeamList from "./listOfMembers";
import { useState, useRef } from "react";
import MemberList from "./listOfMembers";
import axios from "axios";
import link from "../API";

const CreateTeamForm = (props) => {
  const [data, setData] = useState(null);
  const [dataMem, setDataMem] = useState(null);
  const [members, setMembers] = useState([]);
  const [errorName, setErrorName] = useState(false);
  const [errorUser, setErrorUser] = useState(false);

  const inputNameRef = useRef();
  const inputMemRef = useRef();

  function addTeam(name, users) {
    axios
      .post(
        link + "/teams",
        {
          name,
          users: users.map((user) => user._id),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        props.update(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const memberCheck = (user) => {
    var check = false;
    if (user.role === "admin") return true;
    if (user.id === props.userId) return true;
    members.forEach((member) => {
      if (member.id === user.id) {
        check = true;
        return;
      }
    });
    return check;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addMember();
    }
  };

  const addMember = () => {
    axios
      .get(link + "/users/username/" + inputMemRef.current.value, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (!memberCheck(response.data)) {
          setMembers([...members, response.data]);
          inputMemRef.current.value = "";
        } else setErrorUser(true);
      })
      .catch((error) => {
        console.log(error);
        setErrorUser(true);
      });
  };

  return (
    <div className="createTeamFormCont">
      <div className="ui input">
        <input
          type="text"
          ref={inputNameRef}
          placeholder="Enter team name"
          onChange={() => {
            if (errorName) setErrorName(false);
          }}
        />
      </div>
      <MemberList teamMembers={members} />
      <div>
        {errorUser === false ? (
          ""
        ) : (
          <div class="ui warning message">
            <i
              class="close icon"
              onClick={() => {
                setErrorUser(false);
              }}
            ></i>
            <div class="header">Invalid username!</div>
          </div>
        )}

        <i
          className="big blue plus square icon"
          onClick={() => {
            addMember();
          }}
        ></i>
        <div className="ui input">
          <input
            type="text"
            ref={inputMemRef}
            onKeyDown={handleKeyDown}
            placeholder="Enter username"
            onChange={() => {
              if (errorUser) setErrorUser(false);
            }}
          />
        </div>
      </div>
      {errorName === false ? (
        ""
      ) : (
        <div class="ui warning message">
          <i
            class="close icon"
            onClick={() => {
              setErrorName(false);
            }}
          ></i>
          <div class="header">You must enter team name!</div>
        </div>
      )}

      <button
        className="large ui button"
        onClick={() => {
          if (inputNameRef.current.value != "") {
            addTeam(inputNameRef.current.value, members);
            setMembers([]);
            inputMemRef.current.value = "";
            inputNameRef.current.value = "";
          } else {
            setErrorName(true);
          }
        }}
        style={{ backgroundColor: " #237dc3", color: "white" }}
      >
        Create team
      </button>
    </div>
  );
};

export default CreateTeamForm;

/*obrisi hardkodirane podatke za clanove tima */
