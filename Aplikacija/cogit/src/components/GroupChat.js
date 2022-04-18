import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import "../style/GroupChat.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import TeamMessages from "./TeamMessages";
import link from "./API";

function GroupChat() {
	const [inputMessage, setInputMessage] = useState("");
	const [teamMessages, setTeamMessages] = useState();
	const currTeam = useLocation().pathname.split("/")[1];
	const [socketSetup, setSocketSetup] = useState(true);
	const [n, setN] = useState(0);

	const socket = useSocket();
	//console.log(teamMessages);

	async function getTeamMessages() {
		//await console.log("call");
		//console.log(n);
		axios
			.get(
				link + "/users/me/teams/" + currTeam + "/messages?limit=20&skip=" + n,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			)
			.then(value => {
				//console.log(teamMessages);
				if (!teamMessages) {
					setTeamMessages(value.data);
				} else
					setTeamMessages(teamMessages => [...teamMessages, ...value.data]);
				setN(n + 20);
			})
			.catch(error => {
				console.log(error);
				if (
					error.response !== undefined &&
					error.response.data.error === "User not found"
				)
					window.location.reload(false);
			})
			.finally(a => {});
	}

	useEffect(() => {
		getTeamMessages();
	}, []);

	const log = () => {
		//console.log("poslata poruka");
	};

	if (socketSetup) {
		//console.log(socket);
		if (socket) {
			//console.log("socket on new message");
			socket.off("new-team-message");
			socket.on("new-team-message", msg => {
				console.log(msg);
				if (msg.team === currTeam)
					setTeamMessages(teamMessages => [msg.message, ...teamMessages]);
			});
			setSocketSetup(false);
		}
	}
	//console.log(socket);

	//..console.log(teamMessages);

	const sendGroupMessage = () => {
		//console.log(socket);
		//console.log(teamMessages);
		if (teamMessages) {
			if (socket) {
				//console.log("emit");
				socket.emit("newMessageToTeam", currTeam, inputMessage, log);
			}

			console.log("inputmessage: " + inputMessage);
			setInputMessage("");
		}
	};

	return (
		<div>
			<div
				onScroll={e => {
					//const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
					if (
						e.target.scrollHeight + e.target.scrollTop ===
						e.target.clientHeight
					) {
						getTeamMessages();
					}
				}}
				className="ui comments fixed-width menu"
				style={{
					height: `${Math.max(
						document.documentElement.clientHeight - 430,
						300
					)}px`,
					backgroundImage:
						localStorage.getItem("DarkMode") === "dark"
							? `url(
									"https://www.transparenttextures.com/patterns/cartographer.png"
							  )`
							: "",
					backgroundColor: "rgba(255, 255, 255, 0.28)",
				}}
			>
				<TeamMessages teamMessages={teamMessages} />
			</div>
			<form className="ui reply form">
				<div className="field">
					<textarea
						style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
						rows="2"
						value={inputMessage}
						onChange={e => setInputMessage(e.target.value)}
						onKeyDown={e => {
							if (e.key === "Enter") {
								sendGroupMessage();
							}
						}}
					></textarea>
				</div>
				<div
					className="ui button"
					onClick={sendGroupMessage}
					style={{ backgroundColor: "rgba(107, 185, 248, 0.801)" }}
				>
					Send message
				</div>
			</form>
		</div>
	);
}

export default GroupChat;
