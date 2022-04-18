import { useState } from "react";

export default function useToken() {
	function getToken() {
		const tokenString = localStorage.getItem("token");
		return tokenString;
	}

	const saveToken = userToken => {
		localStorage.setItem("token", userToken);
		setToken(userToken);
	};

	const [token, setToken] = useState(getToken());

	return {
		setToken: saveToken,
		token,
	};
}
