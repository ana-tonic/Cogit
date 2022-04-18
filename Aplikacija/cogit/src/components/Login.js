import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext.js";
import "../style/Login.css";
import "../fonts/Happy-Hell.ttf";
import link from "./API.js";

async function loginUser(user) {
  console.log("loginUser");

  return axios.post(link + "/users/login", user).catch((error) => {
    if (error.response) alert(error.response.data.error);
    else alert(error);
  });
}

function Login({ setToken }) {
  const [user, setUser] = useContext(UserContext);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const submitHandler = async (e) => {
    console.log("Poziv submitHandler");
    e.preventDefault();

    const userToken = await loginUser({
      id: email, //email
      password: password, //password
    });
    if (userToken) {
      setUser({
        token: userToken.data.token,
        email: userToken.data.user.email,
        username: userToken.data.user.username,
        notificationNumber: userToken.data.notificationNumber,
        avatar: user.avatar,
        avatarSrc: user.avatarSrc,
        id: userToken.data.user.id,
      });
      //console.log(userToken.data.user.id);
      setToken(userToken.data.token);
    }
  };

  return (
    <div className="Login">
      <div className="LoginImage">
        <div className="LoginLogo"></div>
        <div className="LoginDescription">
          <div
            style={{
              marginLeft: "10px",
              fontSize: "40px",
              fontFamily: "montserrat, sans-serif",
            }}
          >
            Cogit
          </div>
          <div
            style={{
              marginLeft: "10px",
              fontSize: "30px",
              fontFamily: "montserrat, sans-serif",
            }}
          >
            Organise your projects
          </div>
        </div>
      </div>
      <form onSubmit={submitHandler}>
        <div className="form-inner login">
          <h2>Login</h2>
          {/* {errorMsg == "" ? <div className="error">errorMsg</div> : ""} */}
          <div className="form-group">
            <label htmlFor="email">Email or username: </label>
            <input
              name="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <input type="submit" value="LOGIN" />

          <Link to="/Register">
            <button type="button" className="registerButton">
              Register
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
