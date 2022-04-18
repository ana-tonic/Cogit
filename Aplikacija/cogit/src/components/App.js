import React from "react";
import MainForm from "./MainForm";
import "../style/MainForm.css";
import { UserProvider } from "../context/UserContext.js";
import { CurrentTeamProvider } from "../context/CurrentTeamContext";
import { ProjectProvider } from "../context/ProjectContext";
import { SocketProvider } from "../context/SocketProvider";
import { TeamLeaderProvider } from "../context/TeamLeaderContext";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
	return (
		<div>
			<UserProvider>
				<SocketProvider>
					<CurrentTeamProvider>
						<ProjectProvider>
							<TeamLeaderProvider>
								<Router>
									<MainForm />
								</Router>
							</TeamLeaderProvider>
						</ProjectProvider>
					</CurrentTeamProvider>
				</SocketProvider>
			</UserProvider>
		</div>
	);
}

export default App;

// socket = io("/users", {
// 	query: {
// 		token: jsonResponse.token,
// 	},
// });
// socket.on("connect_error", err => {
// 	console.log(err.message); // prints the message associated with the error
// });
// socket.on("user-disconnected", payload => {
// 	console.log(payload); // prints the message associated with the error
// });
// socket.on("new-message", ({ username, message }) => {
// 	console.log(username, message);
// 	$messageBoard.innerHTML += (
// 		<p>
// 			${username}:${message}
// 		</p>
// 	);
// });
// socket.on("check-connection", id => {
// 	console.log("still");
// 	if (!globalVariable) socket.emit("keep-alive", id);
// });
// socket.on("new-notification", notif => {
// 	console.log(notif);
// });
