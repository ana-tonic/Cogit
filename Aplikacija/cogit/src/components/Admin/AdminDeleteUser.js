import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import link from "../API";

function AdminDeleteUser({ loadUsers, setShowUsers, users }) {
  const [searchUserId, setSearchUserId] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");
  const [suspendUserId, setSuspendUserId] = useState("");
  const [days, setDays] = useState("");
  const [timeout, settimeout] = useState();

  function findUser() {
    if (timeout) clearTimeout(timeout);
    settimeout(
      setTimeout(() => {
        if (searchUserId) {
          let regex = new RegExp(`${searchUserId}`, "i");
          let newShowUsers = [];
          if (users.length > 0)
            newShowUsers = users.filter((user) => regex.test(user.username));
          setShowUsers(newShowUsers);
        } else {
          setShowUsers(users);
        }
      }, 100)
    );
  }

  useEffect(findUser, [searchUserId]);

  function deleteUser() {
    if (deleteUserId)
      axios
        .delete(link + "/users/" + deleteUserId, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((value) => {})
        .catch((error) => {
          console.log(error);
          alert(error.response.data.error);
        })
        .finally((a) => {
          loadUsers();
          console.log("Deleted user" + deleteUserId);
        });
    setDeleteUserId("");
  }
  function suspendUser() {
    if (suspendUserId) {
      if (days) {
        axios
          .patch(
            link + "/users/" + suspendUserId + "/suspend",
            {
              days: days,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then((value) => {})
          .catch((error) => {
            console.log(error);
            alert(error.response.data.error);
          })
          .finally((a) => {
            loadUsers();
            console.log(
              "Suspended user " + suspendUserId + " for " + days + " days"
            );
          });
        setSuspendUserId("");
        setDays("");
      }
    }
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.reload(false);
  }

  return (
    <div
      className=""
      style={{
        position: "sticky",
        top: "0",
        height: "80px",
        paddingTop: "20px",
        paddingRight: "20px",
        width: "min-content",
      }}
    >
      <Link to={`/`} className="ui green button" style={{ width: "100%" }}>
        Back
      </Link>

      <div
        className="ui orange label"
        style={{ width: "100%", marginTop: "20px" }}
      >
        FIND USER
      </div>
      <div
        className="ui icon input"
        style={{
          border: "2px solid orange",
          borderRadius: "5px",
          marginTop: "5px",
          marginBottom: "5px",
        }}
      >
        <input
          value={searchUserId}
          type="text"
          placeholder="Username..."
          onChange={(e) => {
            setSearchUserId(e.target.value);
          }}
        />
      </div>
      <div
        className="ui icon input"
        style={{
          border: "2px solid red",
          borderRadius: "5px",
          marginTop: "20px",
          marginBottom: "5px",
        }}
      >
        <input
          value={deleteUserId}
          type="text"
          placeholder="User id..."
          onChange={(e) => {
            setDeleteUserId(e.target.value);
          }}
        />
      </div>
      <button
        className="ui red button"
        style={{ width: "100%" }}
        onClick={deleteUser}
      >
        DELETE USER
      </button>
      <div
        className="ui icon input"
        style={{
          border: "2px solid teal",
          borderRadius: "5px",
          marginTop: "20px",
          marginBottom: "5px",
        }}
      >
        <input
          value={suspendUserId}
          type="text"
          placeholder="User id..."
          onChange={(e) => {
            setSuspendUserId(e.target.value);
          }}
        />
      </div>
      <div
        className="ui icon input"
        style={{
          border: "2px solid teal",
          borderRadius: "5px",
          marginBottom: "5px",
        }}
      >
        <input
          value={days}
          type="number"
          id="quantity"
          name="quantity"
          placeholder="Number of days..."
          min="1"
          max="50000"
          style={{
            MozAppearance: "textfield",
            margin: "0",
          }}
          onChange={(e) => {
            setDays(e.target.value);
          }}
        />
      </div>
      <input
        type="button"
        id="quantity"
        name="quantity"
        className="ui teal button"
        style={{ width: "100%" }}
        onClick={suspendUser}
        value="SUSPEND USER"
      />
    </div>
  );
}

export default AdminDeleteUser;
