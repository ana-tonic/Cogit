import React from "react";

const Logout = () => {
	function LogoutButton() {
		localStorage.removeItem("token");
		window.location.reload(false);
	}
	return (
		<button
			onClick={LogoutButton}
			className="ui large red button"
			style={{ height: "40px" }}
		>
			Logout
		</button>
	);
};

export default Logout;
