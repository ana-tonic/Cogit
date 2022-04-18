import Note from "./note";
import React, { useState, useEffect, useRef } from "react";
import "./styleN.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ListsLoader from "../Project/ListsLoader";
import link from "../API.js";

const Notes = (props) => {
  const [notes, setNotes] = useState([]);
  const teamID = useLocation().pathname.split("/")[1];
  const [rerF, setRerF] = useState(true);
  const [active, setActive] = useState(true);
  const _isMounted = useRef(true);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);

  async function fetchUser() {
    try {
      const response = await axios.get(link + "/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(response.data);
    } catch (e) {
      console.log(e.response.data.error);
    }
  }

  async function fetchTeam() {
    try {
      const response = await axios.get(link + "/teams/" + teamID, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTeam(response.data);
    } catch (e) {
      console.log(e.data.reposne.error);
    }
  }

  async function fetchNotes() {
    try {
      const response = await axios.get(link + "/notes/teams/" + teamID, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (_isMounted.current) {
        console.log(response.data);
        setNotes(response.data);
        setActive(false);
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response);
      }
    }
  }

  async function deleteNote(idNote) {
    await axios
      .delete(link + "/notes/" + idNote, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        //fetchNotes();
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function addNote(noteText) {
    setActive(true);
    axios
      .post(
        link + "/notes/teams/" + teamID,
        {
          text: noteText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        notes.shift();
        setNotes([
          {
            _id: response.data._id,
            text: response.data.text,
          },
          ...notes,
        ]);
        setActive(false);
      })
      .catch((e) => {
        console.log(e);
        setActive(false);
      });
  }

  function updateNote(noteID, noteText) {
    axios
      .patch(
        link + "/notes/" + noteID,
        {
          text: noteText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        //fetchNotes();
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function removeNote(noteId) {
    var notesP = notes.filter((obj) => obj._id != noteId);
    //setNotes([]);
    setNotes(notesP);
    deleteNote(noteId);
  }

  useEffect(() => {
    fetchUser();
    fetchNotes();
    fetchTeam();
    return () => {
      _isMounted.current = false;
    };
  }, []);

  var notesList;

  if (notes !== undefined) {
    notesList = notes.map(({ _id, text, creatorId }) => {
      return (
        <Note
          key={_id ? _id : notes ? notes.length : 0}
          id={_id}
          text={text}
          addNote={addNote}
          updateNote={updateNote}
          removeMe={removeNote}
          accessR={
            creatorId != undefined
              ? user != undefined
                ? user.id === creatorId.id || user.role === "admin"
                : false
              : true
          }
          accessR2={
            creatorId != undefined
              ? user != null && team != null
                ? user.id === creatorId.id ||
                  user.role === "admin" ||
                  user.id === team.leaderId
                : false
              : true
          }
        />
      );
    });
  } else {
    setNotes([]);
  }

  return (
    <div className="wrapperS">
      <div className="btnDiv">
        <button
          className="ui blue button"
          onClick={() => {
            setNotes(["", ...notes]);
          }}
        >
          Add new note
        </button>
      </div>
      <div className="loader">
        <ListsLoader active={active} height="300px" />
      </div>
      {active === false ? <div className="notes">{notesList}</div> : ""}
    </div>
  );
};

export default Notes;
