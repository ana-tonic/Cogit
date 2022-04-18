import React from "react";
import { Route, useRouteMatch } from "react-router-dom";
import MyCalendar from "./Calendar";
import TeamMembers from "./TeamMembers";
import Notes from "./Notes/listOfNotes";
import ProfilePage from "./ProfilePage";
import ActivityList from "./ActivityPage/listOfActivities";
import ChatPage from "./Chat - direct messages/chatPage";
import ProjectsRoutes from "./ProjectsRoutes.js";

const TeamComponents = ({ teamID, projects, fetchTeams, teamName }) => {
	let { path } = useRouteMatch();

	const teamMembers = () => (
		<TeamMembers fetchTeams={fetchTeams} teamName={teamName} />
	);

	if (teamID && teamName)
		return (
			<div className="Lower" style={{ flexGrow: "1" }}>
				<Route path={`${path}/Activity`} exact component={ActivityList} />
				<Route path={`${path}/Calendar`} exact component={MyCalendar} />
				<Route path={`${path}/TeamMembers`} exact component={teamMembers} />
				<Route path={`${path}/TeamNotes`} exact component={Notes} />
				<Route path={`${path}/DirectMessages`} exact component={ChatPage} />
				<Route path={`${path}/Profile`} exact component={ProfilePage} />
				<Route path={`${path}/`} exact component={ActivityList} />

				<ProjectsRoutes
					teamID={teamID}
					projects={projects}
					fetchTeams={fetchTeams}
					teamName={teamName}
				/>
			</div>
		);
};
export default TeamComponents;
