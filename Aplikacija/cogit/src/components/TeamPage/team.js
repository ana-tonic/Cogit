import React from "react";
import { useState } from "react";
import TeamSettings from "./teamSettings";
import { Link } from "react-router-dom";

const Team = props => {
	const [popup, setPopup] = useState(false);
	const [name, setName] = useState(props.teamName);

	return (
		<div
			className="team"
			style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
		>
			<Link to={`${props.id}`} style={{ color: "black", flexGrow: "1" }}>
				<div className="omotac">
					<div>
						<i className="big users icon"></i>
					</div>
					<div>
						<label className="labelT">{name}</label>
					</div>
				</div>
			</Link>

			<div className="cogDiv">
				<i
					className="big cog icon"
					onClick={() => {
						setPopup(true);
					}}
				></i>
			</div>

			<TeamSettings
				trigger={popup}
				admin={props.admin}
				setTriger={setPopup}
				name={props.teamName}
				setNewName={setName}
				leaderFlag={props.userId == props.leaderId ? true : false}
				removeMe={props.removeMe}
				remove={props.remove}
				teamId={props.id}
				ind={props.ind}
			/>
		</div>
	);
};

export default Team;
