import React, { useState, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext.js";
import link from "./API";

function Register({ setToken }) {
	const [user, setUser] = useContext(UserContext);
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();
	const [username, setUsername] = useState();
	const history = useHistory();

	async function registerUser(user) {
		return await axios
			.post(link + "/users", user)
			.catch(error => {
				if (error.response) alert(error.response.data.error);
				else alert(error);
			})
			.finally(() => {
				history.push("/");
			});
	}

	const submitHandler = async e => {
		e.preventDefault();

		const userToken = await registerUser({
			username: username,
			email: email,
			password: password,
		});
		if (userToken) {
			setUser({
				token: userToken.data.token,
				email: userToken.data.user.email,
				username: userToken.data.user.username,
				notificationNumber: user.notificationNumber,
				avatar: user.avatar,
				avatarSrc: user.avatarSrc,
				id: userToken.data.user.id,
			});
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
					<h2>Register</h2>
					{/* {errorMsg != "" ? <div className="error">{errorMsg}</div> : ""} */}
					<div className="form-group">
						<label htmlFor="name">Username:</label>
						<input
							type="text"
							name="name"
							id="name"
							onChange={e => setUsername(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="email">Email: </label>
						<input
							type="email"
							name="email"
							id="email"
							onChange={e => setEmail(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="password">Password:</label>
						<input
							type="password"
							name="password"
							id="password"
							onChange={e => setPassword(e.target.value)}
						/>
					</div>
					<Link to="/">
						<button type="button" className="backButton">
							Back
						</button>
					</Link>
					<input type="submit" value="REGISTER" className="registerButton" />
				</div>
			</form>
		</div>
	);
}

export default Register;
