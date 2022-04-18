import React from "react";
import Contact from "./contact";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ListsLoader from "../Project/ListsLoader";
import link from "../API";

const Contacts = (props) => {
  const [contacts, setContacts] = useState(props.contacts);
  // const [active, setActive] = useState(true);
  const [rmvF, setR] = useState(false);
  const [rendFlag, setRendFlag] = useState(false);
  const [btnRF, setBtnRF] = useState(true);
  const [numA, setNumA] = useState(0);
  const [plusFlag, setPlusFlag] = useState(false);
  const [emFlag, setEmFlag] = useState(true);
  const [errorUser, setErrorUser] = useState(false);
  const _isMounted = useRef(true);

  var contactList;
  var counter = 0;
  var len = 0;

  const inputRef = useRef();

  async function fetchContacts() {
    try {
      const response = await axios.get(
        link + "/users/me/contacts?limit=10&skip=" + contactList.length,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (_isMounted.current) {
        if (
          contacts == null ||
          contacts == undefined ||
          contacts.length === 0
        ) {
          if (response.data != null) setContacts(response.data);
        } else setContacts(contacts.concat(response.data));
        //setNumA(numA + 10);
        if (response.data != null)
          if (response.data.length < 10) {
            if (plusFlag) setPlusFlag(false);
          } else {
            if (!plusFlag) setPlusFlag(true);
          }
        if (emFlag === true) {
          if (response != undefined) props.setUser(response.data[0]);
          setEmFlag(false);
          // props.setActive(false);
          // setActive(false);
        }
      }
    } catch (err) {
      if (err.response) {
        // setActive(false);
        console.log(err.response.data.error);
        alert(err.response.data.error);
      }
    }
  }

  const memberCheck = (id) => {
    var check = false;
    contacts.forEach((contact) => {
      if (contact.id === id) {
        check = true;
        return;
      }
    });
    return check;
  };

  function addContact(userName) {
    axios
      .patch(
        link + "/users/me/contacts/" + userName,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        if (!memberCheck(response.data.id)) {
          setContacts([...contacts, response.data]);
          inputRef.current.value = "";
        } else setErrorUser(true);
      })
      .catch((e) => {
        console.log(e);
        setErrorUser(true);
      });
  }

  async function deleteContact(userName) {
    try {
      const response = await axios.patch(
        link + "/users/me/contacts/" + userName,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  const sortContacts = (userId) => {
    const contact = contacts.find((con) => con._id === userId);
    if (contact)
      setContacts([contact, ...contacts.filter((con) => con.id !== userId)]);
  };

  const removeContact = (ind, userName) => {
    contacts.splice(ind, 1);
    setRendFlag(!rendFlag);
    props.setUser(contacts[0]);
    deleteContact(userName);
  };
  props.obj.messageReceived = (user, numOfUnreadMessages) => {
    if (contacts.find((contact) => contact._id === user._id)) {
      setContacts(
        contacts.map((contact) => {
          if (contact._id === user._id)
            contact.numOfUnreadMessages = numOfUnreadMessages;
          return contact;
        })
      );
      return sortContacts(user._id);
    }
    user.numOfUnreadMessages = numOfUnreadMessages;
    setContacts([user, ...contacts]);
  };
  props.obj.messagesFetched = (userId) => {
    if (contacts.find((contact) => contact._id === userId)) {
      setContacts(
        contacts.map((contact) => {
          if (contact._id === userId) contact.numOfUnreadMessages = 0;
          return contact;
        })
      );
    }
  };
  props.obj.sortContacts = sortContacts;

  useEffect(() => {
    fetchContacts();
    /*return () => {
      _isMounted.current = false;
    };*/
  }, []);

  if (contacts !== undefined) {
    contactList = contacts.map(
      ({ id, username, email, avatar, active, numOfUnreadMessages }) => (
        <Contact
          key={id}
          id={id}
          username={username}
          rmvFlag={rmvF}
          email={email}
          ind={counter++}
          avatar={avatar}
          removeMe={removeContact}
          setUser={props.setUser}
          active={active}
          unreadMessagesFlag={
            props.user != undefined
              ? id === props.user.id
                ? false
                : true
              : false
          }
          unreadMessages={numOfUnreadMessages}
        />
      )
    );
    len = contacts.length;
  } else {
    setContacts([]);
    len = 0;
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (inputRef.current.value != null) {
        addContact(inputRef.current.value);
      } else {
        setErrorUser(true);
      }
    }
  };

  return (
    <div className="contacts">
      <label className="lab">Contacts</label>

      {len !== 0 ? (
        <button
          className="red big ui button"
          onClick={() => {
            setR(!rmvF);
          }}
        >
          Remove contact
        </button>
      ) : (
        ""
      )}
      {/* <ListsLoader active={active} height="300px" /> */}
      <div className="conList">{contactList}</div>

      {plusFlag === true ? (
        <i
          className="big plus circle icon"
          onClick={() => {
            fetchContacts();
          }}
        ></i>
      ) : (
        ""
      )}

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
      <div className="controls">
        <div className="ui input">
          <input
            ref={inputRef}
            placeholder="Enter username"
            onChange={() => {
              if (errorUser) setErrorUser(false);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          style={{ "background-color": "rgba(107, 185, 248, 0.801)" }}
          className="big ui button"
          onClick={() => {
            if (inputRef.current.value != null) {
              addContact(inputRef.current.value);
            } else {
              setErrorUser(true);
            }
          }}
        >
          Add new contact
        </button>
      </div>
    </div>
  );
};

export default Contacts;
