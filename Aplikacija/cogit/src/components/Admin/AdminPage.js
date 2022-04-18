import React, { useEffect, useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminDeleteUser from "./AdminDeleteUser";
import "./AdminPage.css";
import link from "../API";
import axios from "axios";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState([]);
  const [loader, setLoader] = useState(true);

  function loadUsers() {
    axios
      .get(link + "/users/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((value) => {
        //console.log(value.data);
        setUsers(value.data);
        setShowUsers(value.data);
      })
      .catch((error) => {
        alert(error);
      })
      .finally((a) => {
        setLoader(false);
      });
  }

  useEffect(() => {
    loadUsers();
  }, []);
  if (loader) return <div></div>;
  else
    return (
      <div className="MainAdmin">
        <div className="AdminUsers">
          <div
            className="ui relaxed divided list"
            style={{ display: "flex", flexWrap: "wrap" }}
          >
            <AdminUsers users={showUsers} />
          </div>
        </div>
        <AdminDeleteUser
          loadUsers={loadUsers}
          setShowUsers={setShowUsers}
          users={users}
        />
      </div>
    );
}

export default AdminPage;
