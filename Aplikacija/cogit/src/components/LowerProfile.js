import React, { useState, useContext } from "react";
import "../style/LowerProfile.css";
import axios from "axios";
import { UserContext } from "../context/UserContext.js";
import AvatarList from "./AvatarList";
import { AvatarsContext } from "../context/AvatarsContext.js";
import { CurrentTeamContext } from "../context/CurrentTeamContext";
import link from "./API";

function LowerProfile() {
	const [user, setUser] = useContext(UserContext);
	const [avatars, setAvatars] = useContext(AvatarsContext); //List of available avatars
	const [active, setActive] = useState("active"); //Loader
	const [avatarid, setAvatarid] = useState(-1); //Picked avatar id
	const [loadingAvatar, setLoadingAvatar] = useState(""); //Confirm avatar loader
	const [loadingUsername, setLoadingUsername] = useState(""); //Confirm username loader
	const [loadingPassword, setLoadingPassword] = useState(""); //Confirm password loader
	const [newUsername, setNewUsername] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [currentTeam, setCurrentTeam] = useContext(CurrentTeamContext);

	//console.log(user);

	const changeUsername = () => {
		setLoadingUsername("loading");
		axios
			.patch(
				link + "/users/me",
				{
					username: newUsername,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			)
			.then(value => {
				setUser({
					token: user.token,
					admin: user.admin,
					email: user.email,
					username: value.data.username,
					notificationNumber: user.notificationNumber,
					avatar: user.avatar,
					avatarSrc: user.avatarSrc,
				});
			})
			.catch(error => {
				if (error.response.data.error === "User not found")
					window.location.reload(false);
				alert(error);
			})
			.finally(a => {
				setLoadingUsername("");
				setNewUsername("");
			});
	};
	const changePassword = () => {
		setLoadingPassword("loading");
		axios
			.patch(
				link + "/users/me",
				{
					password: newPassword,
					oldPassword,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			)
			.then(value => {
				setUser({
					token: user.token,
					email: user.email,
					admin: user.admin,
					username: user.username,
					notificationNumber: user.notificationNumber,
					avatar: user.avatar,
					avatarSrc: user.avatarSrc,
				});
			})
			.catch(error => {
				if (error.response) {
					if (error.response.data.error === "User not found")
						window.location.reload(false);
					else alert(error.response.data.error);
				} else alert(error);
			})
			.finally(a => {
				setNewPassword("");
				setOldPassword("");
				setLoadingPassword("");
			});
	};

	function setTheme() {
		if (localStorage.getItem("DarkMode") === "dark") {
			localStorage.setItem("DarkMode", "light");
			document.body.style.backgroundImage = "";

			axios
				.patch(
					link + "/users/me/settings",
					{
						theme: "light",
					},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				)
				.then(value => {})
				.catch(error => {
					if (error.response.data.error === "User not found")
						window.location.reload(false);
				})
				.finally(a => {});
		} else {
			localStorage.setItem("DarkMode", "dark");
			document.body.style.backgroundImage =
				"url(" +
				"https://www.transparenttextures.com/patterns/cartographer.png" +
				")";

			axios
				.patch(
					link + "/users/me/settings",
					{
						theme: "dark",
					},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				)
				.then(value => {})
				.catch(error => {
					if (error.response.data.error === "User not found")
						window.location.reload(false);
				})
				.finally(a => {});
		}
		setCurrentTeam(localStorage.getItem("DarkMode"));
	}

	function setdefaultAvatar() {
		if (avatarid !== -1) {
			setLoadingAvatar("loading");
			axios
				.patch(
					link + "/users/me/avatars/" + avatarid,
					{},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				)
				.then(value => {
					setUser({
						token: user.token,
						email: user.email,
						admin: user.admin,
						username: user.username,
						notificationNumber: user.notificationNumber,
						avatar: value.data.name,
						avatarSrc: `data:image/png;base64,${value.data.picture}`,
					});
					console.log(value.data.name);
					//console.log(user);
				})
				.catch(error => {
					alert(error);
					if (error.response.data.error === "User not found")
						window.location.reload(false);
				})
				.finally(a => {
					setAvatarid(-1);
					setLoadingAvatar("");
				});
		}
	}

	if (avatars.length === 1) {
		//Geting initial list of available  avatars
		axios
			.get(link + "/avatars", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			.then(value => {
				setAvatars(value.data);
			})
			.catch(error => {
				alert(error);
				if (error.response.data.error === "User not found")
					window.location.reload(false);
			})
			.finally(a => {
				setActive("");
			});
	}

	return (
		<div className="LowerProfile">
			<div className="LowerProfileLeft">
				<button
					className="ui button"
					onClick={setTheme}
					style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
				>
					Toggle background
				</button>
				<div className="ProfileInput">
					Enter new username
					<div className="ui input">
						<input
							type="text"
							placeholder="New username..."
							onChange={e => {
								setNewUsername(e.target.value);
							}}
							value={newUsername}
						/>
					</div>
				</div>
				<button
					style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
					className={`ui button ${loadingUsername}`}
					onClick={changeUsername}
				>
					Change username
				</button>
				<div className="ProfileInput">
					Enter current password
					<div className="ui input">
						<input
							type="password"
							placeholder="Current password..."
							onChange={e => {
								setOldPassword(e.target.value);
							}}
							value={oldPassword}
						/>
					</div>
				</div>
				<div className="ProfileInput">
					Enter new password
					<div className="ui input">
						<input
							type="password"
							placeholder="New password..."
							onChange={e => {
								setNewPassword(e.target.value);
							}}
							value={newPassword}
						/>
					</div>
				</div>
				<button
					style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
					className={`ui button ${loadingPassword}`}
					onClick={changePassword}
				>
					Change password
				</button>
			</div>
			<div className="LowerProfileRight">
				<button
					className="ui active button"
					style={{
						cursor: "default",
						backgroundColor: "rgba(209, 229, 245, 0.801)",
					}}
				>
					Change avatar
				</button>
				<AvatarList
					Avatars={avatars}
					avatarid={avatarid}
					setDefault={setAvatarid}
				/>
				<button
					style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
					className={`ui button ${loadingAvatar}`}
					onClick={setdefaultAvatar}
				>
					Confirm
				</button>
			</div>
			<div
				style={{ backgroundColor: "rgba(0,0,0,.95)" }}
				className={`ui ${active} dimmer`}
			>
				<div className="ui loader"></div>
			</div>
		</div>
	);
}

export default LowerProfile;
