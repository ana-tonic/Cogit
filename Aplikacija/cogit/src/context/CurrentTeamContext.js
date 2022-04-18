import React, { useState, createContext } from "react";

export const CurrentTeamContext = createContext();

export const CurrentTeamProvider = props => {
	const [currentTeam, setCurrentTeam] = useState("");

	return (
		<CurrentTeamContext.Provider value={[currentTeam, setCurrentTeam]}>
			{props.children}
		</CurrentTeamContext.Provider>
	);
};
