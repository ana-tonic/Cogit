import { useState } from "react";

export default function DarkMode() {
	function getMode() {
		const dakrmode = localStorage.getItem("DarkMode");
		return dakrmode;
	}

	const saveMode = mode => {
		localStorage.setItem("DarkMode", mode);
		setDarkMode(mode);
	};

	const [darkMode, setDarkMode] = useState(getMode());

	return {
		setDarkMode: saveMode,
		darkMode,
	};
}
