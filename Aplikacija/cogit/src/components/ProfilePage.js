import React, { useContext } from "react";
import "../style/ProfilePage.css";
import { UserContext } from "../context/UserContext.js";
import axios from "axios";
import LowerProfile from "./LowerProfile";
import { AvatarsProvider } from "../context/AvatarsContext.js";
import Logout from "./Logout";

function ProfilePage() {
	const [user, setUser] = useContext(UserContext);
	//console.log("rerender");

	return (
		<div className="MainProfilePage">
			<div className="UpperProfilePage">
				<div className="ImageAndDetails">
					<div className="ui tiny image">
						<img src={user.avatarSrc} alt={user.avatar} />
					</div>
					<div className="ProfileDetails">
						<div className="ProfileDetails">
							<div
								className="ui label"
								style={{ backgroundColor: "rgba(209, 229, 245, 0.801)" }}
							>
								<i className="user circle icon"> {user.username}</i>
							</div>
						</div>
						<div className="ProfileDetails">
							<div
								className="ui label"
								style={{ backgroundColor: "rgba(209, 229, 245, 0.801)" }}
							>
								<i className="mail icon"> {user.email}</i>
							</div>
						</div>
					</div>
				</div>

				<Logout />
			</div>
			<div className="ui divider"></div>
			<AvatarsProvider>
				<LowerProfile />
			</AvatarsProvider>
		</div>
	);
}

export default ProfilePage;
